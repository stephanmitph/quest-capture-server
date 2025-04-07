import * as net from "net"
import * as fs from "fs"
import * as path from "path"
import prisma from "./prisma"
import { processVideoFrames } from "./video-processor"

// Configuration
const PORT = Number.parseInt(process.env.TCP_SERVER_PORT || "8080")
const SAVE_FRAMES = true
const FRAMES_DIR = path.join(process.cwd(), "received_frames")
const TRACKING_FILE = path.join(process.cwd(), "tracking_data.json")

// Create frames directory if saving frames
if (SAVE_FRAMES) {
  if (!fs.existsSync(FRAMES_DIR)) {
    fs.mkdirSync(FRAMES_DIR, { recursive: true })
  }
}

// Initialize tracking data array that will store all tracking data
const trackingData: any[] = []

// Track client connections
let clientId = 0
const clients = new Map<
  number,
  {
    socket: net.Socket
    frameCount: number
    buffer: Buffer
    state: "MESSAGE_TYPE" | "TRACKING_LENGTH" | "TRACKING_DATA" | "IMAGE_LENGTH" | "IMAGE_DATA"
    expectedLength: number | null
    messageType: number | null
    collectionId: string | null
  }
>()

// Create TCP server
export function startTcpServer() {
  const server = net.createServer((socket) => {
    const id = clientId++
    console.log(`Client #${id} connected from ${socket.remoteAddress}:${socket.remotePort}`)

    // Initialize client state
    clients.set(id, {
      socket,
      frameCount: 0,
      buffer: Buffer.alloc(0),
      state: "MESSAGE_TYPE",
      expectedLength: null,
      messageType: null,
      collectionId: null,
    })

    // Handle data received from client
    socket.on("data", (data) => {
      const client = clients.get(id)!
      client.buffer = Buffer.concat([client.buffer, data])

      console.log(`Client #${id} sent ${data.length} bytes`)
      // Process as many complete frames as possible
      processData(id)
    })

    // Handle client disconnection
    socket.on("close", async () => {
      console.log(`Client #${id} disconnected`)
      const client = clients.get(id)!

      // Save tracking data when client disconnects
      saveTrackingData()

      // Process video if we have frames and a collection ID
      if (client.frameCount > 0 && client.collectionId) {
        try {
          // Create a processing job in the database
          const job = await prisma.videoProcessingJob.create({
            data: {
              clientId: id,
              collectionId: client.collectionId,
              status: "processing",
            },
          })

          console.log(`Created video processing job ${job.id} for client #${id}`)

          // Process the video frames
          const result = await processVideoFrames(id, client.collectionId, FRAMES_DIR)

          // Update the job status
          if (result.success) {
            await prisma.videoProcessingJob.update({
              where: { id: job.id },
              data: {
                status: "completed",
                videoId: result.videoPath?.split("/").pop()?.split(".")[0],
              },
            })
            console.log(`Video processing completed for client #${id}`)
          } else {
            await prisma.videoProcessingJob.update({
              where: { id: job.id },
              data: {
                status: "failed",
                error: result.error,
              },
            })
            console.error(`Video processing failed for client #${id}: ${result.error}`)
          }
        } catch (error) {
          console.error(`Error processing video for client #${id}:`, error)
        }
      }

      clients.delete(id)
    })

    // Handle errors
    socket.on("error", (err) => {
      console.error(`Error with client #${id}: ${err.message}`)
      socket.destroy()
    })
  })

  // Handle server shutdown gracefully
  process.on("SIGINT", () => {
    console.log("Server shutting down...")
    saveTrackingData()
    server.close(() => {
      console.log("TCP server closed")
    })
  })

  // Start the server
  server.listen(PORT, () => {
    console.log(`Video stream server running on port ${PORT}`)
    console.log(`Saving image frames to: ${path.resolve(FRAMES_DIR)}`)
    console.log(`Saving tracking data to: ${path.resolve(TRACKING_FILE)}`)
  })

  return server
}

// Process data from the buffer based on state machine
function processData(clientId: number): void {
  const client = clients.get(clientId)!

  // Continue processing until we don't have enough data
  while (client.buffer.length > 0) {
    switch (client.state) {
      case "MESSAGE_TYPE":
        // Need at least 1 byte for message type
        if (client.buffer.length < 1) return

        client.messageType = client.buffer[0]
        client.buffer = client.buffer.subarray(1)

        // Determine next state based on message type
        if (client.messageType === 1) {
          // Frame data
          client.state = "TRACKING_LENGTH"
          console.log(`Client #${clientId}: Received frame data message`)
        } else {
          console.error(`Client #${clientId}: Unknown message type: ${client.messageType}`)
          // Reset to message type to recover from error
          client.state = "MESSAGE_TYPE"
        }
        break

      case "TRACKING_LENGTH":
        // Need at least 4 bytes for tracking length
        if (client.buffer.length < 4) return

        // Get tracking data length
        client.expectedLength = client.buffer.readInt32LE(0)
        client.buffer = client.buffer.subarray(4)
        client.state = "TRACKING_DATA"
        console.log(`Client #${clientId}: Expecting tracking data of ${client.expectedLength} bytes`)
        break

      case "TRACKING_DATA":
        // Check if we have the full tracking data
        if (client.buffer.length < client.expectedLength!) return

        // Extract tracking data
        const trackingBuffer = client.buffer.subarray(0, client.expectedLength!)
        const trackingJson = trackingBuffer.toString("utf8")
        client.buffer = client.buffer.subarray(client.expectedLength!)

        // Process tracking data
        handleTrackingData(clientId, trackingJson)

        // Move to next state
        client.state = "IMAGE_LENGTH"
        client.expectedLength = null
        break

      case "IMAGE_LENGTH":
        // Need at least 4 bytes for image length
        if (client.buffer.length < 4) return

        // Get image data length
        client.expectedLength = client.buffer.readInt32LE(0)
        client.buffer = client.buffer.subarray(4)
        client.state = "IMAGE_DATA"
        console.log(`Client #${clientId}: Expecting image data of ${client.expectedLength} bytes`)
        break

      case "IMAGE_DATA":
        // Check if we have the full image data
        if (client.buffer.length < client.expectedLength!) return

        // Extract image data
        const imageData = client.buffer.subarray(0, client.expectedLength!)
        client.buffer = client.buffer.subarray(client.expectedLength!)
        client.frameCount++

        // Process image data
        handleImageFrame(clientId, imageData)

        // Reset for next message
        client.state = "MESSAGE_TYPE"
        client.expectedLength = null
        client.messageType = null
        break
    }
  }
}

// Handle tracking data
function handleTrackingData(clientId: number, trackingJson: string): void {
  try {
    const data = JSON.parse(trackingJson)

    // Add client ID and frame number to tracking data
    const client = clients.get(clientId)!
    data.clientId = clientId

    // Extract collection ID if present
    if (data.collectionId && typeof data.collectionId === "string") {
      client.collectionId = data.collectionId
      console.log(`Client #${clientId} is recording for collection: ${client.collectionId}`)
    }

    // Add to tracking data array
    trackingData.push(data)

    console.log(`Received tracking data for client #${clientId}, frame #${client.frameCount + 1}`)
  } catch (err) {
    console.error(`Error parsing tracking data: ${err}`)
  }
}

// Handle a complete image frame
function handleImageFrame(clientId: number, frameData: Buffer): void {
  const client = clients.get(clientId)!
  console.log(`Received frame #${client.frameCount} (${frameData.length} bytes) from client #${clientId}`)

  // Save frame to file if enabled
  if (SAVE_FRAMES) {
    const filename = path.join(FRAMES_DIR, `client${clientId}_frame${client.frameCount}.jpg`)
    fs.writeFile(filename, frameData, (err) => {
      if (err) console.error(`Error saving frame: ${err.message}`)
      else console.log(`Saved frame to ${filename}`)
    })
  }
}

// Save tracking data to file
function saveTrackingData(): void {
  console.log("Saving tracking data...")
  if (trackingData.length === 0) return

  console.log("Stats:")
  console.log("Number of frames: ", trackingData.length)

  if (trackingData.length > 1) {
    const duration = (trackingData[trackingData.length - 1].timestamp - trackingData[0].timestamp) / 1000
    console.log("Duration: ", duration)
    console.log("Average FPS: ", trackingData.length / duration)
  }

  try {
    fs.writeFileSync(TRACKING_FILE, JSON.stringify(trackingData, null, 2))
    console.log(`Saved tracking data to ${TRACKING_FILE}`)
  } catch (err) {
    console.error(`Error saving tracking data: ${err}`)
  }
}

