import * as fs from "fs"
import * as path from "path"
import { exec } from "child_process"
import { promisify } from "util"
import prisma from "./prisma"

const execAsync = promisify(exec)

export interface VideoProcessingResult {
  success: boolean
  videoPath?: string
  error?: string
}

export async function processVideoFrames(
  clientId: number,
  collectionId: string,
  framesDir: string,
): Promise<VideoProcessingResult> {
  try {
    const outputDir = path.join(process.cwd(), "public", "videos")

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Generate a unique video ID
    const videoId = `${Date.now()}_${clientId}`
    const outputPath = path.join(outputDir, `${videoId}.mp4`)
    const relativeOutputPath = `/videos/${videoId}.mp4`

    // Create a temporary directory for processing
    const tempDir = path.join(process.cwd(), "tmp", videoId)
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    // Create list of frames
    const framesListPath = path.join(tempDir, "frames.txt")
    const sortedFramesPath = path.join(tempDir, "sorted_frames.txt")

    // Get all frames for this client and sort them
    const framePattern = `client${clientId}_frame*.jpg`
    const frameFiles = fs
      .readdirSync(framesDir)
      .filter((file) => file.match(framePattern))
      .sort((a, b) => {
        const numA = Number.parseInt(a.match(/frame(\d+)\.jpg/)?.[1] || "0")
        const numB = Number.parseInt(b.match(/frame(\d+)\.jpg/)?.[1] || "0")
        return numA - numB
      })

    if (frameFiles.length === 0) {
      throw new Error("No frames found for processing")
    }

    // Write frame list to file
    fs.writeFileSync(framesListPath, frameFiles.map((file) => path.join(framesDir, file)).join("\n"))

    // Create sorted frames file for ffmpeg
    await execAsync(`awk '{print "file \\047" $0 "\\047"}' ${framesListPath} > ${sortedFramesPath}`)

    // Calculate framerate from tracking data if available
    let framerate = 30 // Default framerate
    const trackingDataPath = path.join(process.cwd(), "tracking_data.json")

    if (fs.existsSync(trackingDataPath)) {
      try {
        const trackingData = JSON.parse(fs.readFileSync(trackingDataPath, "utf8"))
        if (trackingData.length > 1) {
          const firstFrame = trackingData[0]
          const lastFrame = trackingData[trackingData.length - 1]
          const duration = (lastFrame.timestamp - firstFrame.timestamp) / 1000 // in seconds
          if (duration > 0) {
            framerate = Math.round(trackingData.length / duration)
          }
        }
      } catch (err) {
        console.error("Error calculating framerate from tracking data:", err)
      }
    }

    // Convert frames to video using ffmpeg
    await execAsync(
      `ffmpeg -r ${framerate} -f concat -safe 0 -i ${sortedFramesPath} -c:v libx264 -pix_fmt yuv420p ${outputPath}`,
    )

    // Get current date and time
    const now = new Date()
    const date = now
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-")

    const time = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })

    // Calculate duration in seconds
    const durationInSeconds = Math.round(frameFiles.length / framerate)

    // Add video to database
    const video = await prisma.video.create({
      data: {
        id: videoId,
        date,
        time,
        duration: `${durationInSeconds}s`,
        collectionId,
        path: relativeOutputPath,
      },
    })

    // Clean up temporary files
    fs.rmSync(tempDir, { recursive: true, force: true })

    return {
      success: true,
      videoPath: relativeOutputPath,
    }
  } catch (error) {
    console.error("Error processing video frames:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

