import * as fs from "fs"
import * as path from "path"
import { exec } from "child_process"
import { promisify } from "util"
import { Video } from "../../shared/file-storage"

const execAsync = promisify(exec)

export interface VideoProcessingResult {
  success: boolean
  error?: string
}

export async function createVideo(videoDir: string): Promise<VideoProcessingResult> {
  try {
    // Generate a unique video ID
    const outputPath = `${videoDir}/video.mp4`;

    // Create a temporary directory for processing
    const tempDir = path.join(videoDir, "tmp")

    // create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    // Create list of frames
    const framesListPath = path.join(tempDir, "frames.txt")
    const sortedFramesPath = path.join(tempDir, "sorted_frames.txt")

    // Get all frames for this client and sort them
    const frameRegex = /^frame\d+\.jpg$/;
    const frameFiles = fs
      .readdirSync(videoDir)
      .filter((file) => file.match(frameRegex))
      .sort((a, b) => {
        const numA = Number.parseInt(a.match(/frame(\d+)\.jpg/)?.[1] || "0")
        const numB = Number.parseInt(b.match(/frame(\d+)\.jpg/)?.[1] || "0")
        return numA - numB
      })

    if (frameFiles.length === 0) {
      throw new Error("No frames found for processing")
    }
    // Write frame list to file
    fs.writeFileSync(framesListPath, frameFiles.map((file) => path.join(videoDir, file)).join("\n"))

    // Create sorted frames file for ffmpeg
    await execAsync(`awk '{print "file \\047" $0 "\\047"}' ${framesListPath} > ${sortedFramesPath}`)

    // Calculate framerate from tracking data if available
    let framerate = 30 // Default framerate
    const videoInfoPath = path.join(videoDir, "info.json")

    if (fs.existsSync(videoInfoPath)) {
      try {
        const info = JSON.parse(fs.readFileSync(videoInfoPath, "utf8")) as Video
        if (info?.averageFps) {
          framerate = info.averageFps
        }
      } catch (err) {
        console.error("Error calculating framerate from tracking data:", err)
      }
    }

    // Convert frames to video using ffmpeg
    await execAsync(
      `ffmpeg -r ${framerate} -f concat -safe 0 -i ${sortedFramesPath} -c:v libx264 -pix_fmt yuv420p ${outputPath}`,
    )

    // Clean up temporary files
    fs.rmSync(tempDir, { recursive: true, force: true })

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error processing video frames:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

