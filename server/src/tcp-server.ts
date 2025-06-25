import * as net from "net"
import * as fs from "fs"
import * as path from "path"
import { createVideoDirectory, Video } from "../../shared/file-storage"
import { createVideo } from "./video-processor"

type ClientState = "MESSAGE_TYPE" | "BEGIN" | "TRACKING_LENGTH" | "TRACKING_DATA" | "IMAGE_LENGTH" | "IMAGE_DATA"

let clientId = 0
const clients = new Map<
  number,
  {
    socket: net.Socket
    frameCount: number
    buffer: Buffer
    state: ClientState
    videoId: string | null
    videoDir: string | null
    collectionId: number | null
    trackingData: Array<any>
    expectedLength: number | null
    messageType: number | null
    isInitializing: boolean
  }
>()

// Create TCP server
export function createTcpServer(): net.Server {
  const server = net.createServer(async (socket) => {
    const id = clientId++
    console.log(`Client #${id} connected from ${socket.remoteAddress}:${socket.remotePort}`)

    // Initialize client state
    clients.set(id, {
      socket,
      frameCount: 0,
      buffer: Buffer.alloc(0),
      state: "MESSAGE_TYPE",
      videoId: null,
      videoDir: null,
      trackingData: [],
      expectedLength: null,
      messageType: null,
      collectionId: null,
      isInitializing: false
    })

    // Handle data received from client
    socket.on("data", async (data) => {
      const client = clients.get(id)!
      client.buffer = Buffer.concat([client.buffer, data])

      // Process as many complete frames as possible
      await processData(id)
    })

    socket.on("close", async () => {
      console.log(`Client #${id} disconnected`)
      clients.delete(id)
    })

    socket.on("error", (err) => {
      console.error(`Error with client #${id}: ${err.message}`)
      socket.destroy()
    })
  })

  // Handle server shutdown gracefully
  process.on("SIGINT", () => {
    console.log("Server shutting down...")
    server.close(() => {
      console.log("TCP server closed")
      process.exit()
    })
  })

  return server
}

// Process data from the buffer based on state machine
async function processData(clientId: number): Promise<void> {
  const client = clients.get(clientId)!

  // Continue processing until we don't have enough data
  while (client.buffer.length > 0) {
    switch (client.state) {
      case "MESSAGE_TYPE":
        // Need at least 1 byte for message type
        if (client.buffer.length < 1) return
        client.messageType = client.buffer[0]
        client.buffer = client.buffer.subarray(1)

        if (client.messageType === 0) {
          client.state = "BEGIN"
        } else if (client.messageType === 1) {
          client.state = "TRACKING_LENGTH"
        } else if (client.messageType === 2) {
          endRecording(clientId);
        } else {
          console.error(`Client #${clientId}: Unknown message type: ${client.messageType}`)
          client.state = "MESSAGE_TYPE"
        }
        break
      case "BEGIN":
        if (client.buffer.length < 4 || client.isInitializing) return
        client.collectionId = client.buffer.readInt32LE(0)
        client.buffer = client.buffer.subarray(4)
        console.log(`Client #${clientId} started recording for collection ${client.collectionId}`)
        client.isInitializing = true 
        await initializeRecording(clientId);
        client.isInitializing = false 
        client.state = "MESSAGE_TYPE"
        break;
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
        await saveImageFrame(clientId, imageData)

        // Reset for next message
        client.state = "MESSAGE_TYPE"
        client.expectedLength = null
        client.messageType = null
        break
    }
  }
}

async function initializeRecording(clientId: number): Promise<void> {
  const client = clients.get(clientId)!
  const videoInfo = await createVideoDirectory(client.collectionId!)

  client.frameCount = 0
  client.trackingData = []
  client.videoId = videoInfo!.videoId
  client.videoDir = videoInfo!.directory
  client.expectedLength = null
  client.messageType = null
  console.log(`Client #${clientId} initialized recording`)
}

function endRecording(clientId: number): void {
  const client = clients.get(clientId)!
  saveTrackingData(clientId)
  saveVideoInfo(clientId)
  createVideo(client.videoDir!).then(() => {console.log("video created")})
}

// Handle a complete image frame
async function saveImageFrame(clientId: number, frameData: Buffer): Promise<void> {
  const client = clients.get(clientId)!
  const filePath = path.join(client.videoDir!, `frame${client.frameCount}.jpg`)

  fs.writeFile(filePath, frameData, (err) => {
    if (err) console.error(`Error saving frame: ${err.message}`)
    else console.log(`Saved frame to ${filePath}`)
  })
}

// Handle tracking data
function handleTrackingData(clientId: number, trackingJson: string): void {
  try {
    const data = JSON.parse(trackingJson)
    const client = clients.get(clientId)!

    // Add to tracking data array
    client.trackingData.push(data)

    console.log(`Received tracking data for client #${clientId}, frame #${client.frameCount + 1}`)
  } catch (err) {
    console.error(`Error parsing tracking data: ${err}`)
  }
}

// Save tracking data to file
function saveTrackingData(clientId: number): void {
  const client = clients.get(clientId)!
  const filepath = path.join(client.videoDir!, "tracking_data.json")
  if (client.trackingData.length === 0) return
  try {
    fs.writeFileSync(filepath, JSON.stringify(client.trackingData, null, 2))
  } catch (err) {
    console.error(`Error saving tracking data: ${err}`)
  }
}

function saveVideoInfo(clientId: number): void {
  const client = clients.get(clientId)!
  const infoPath = path.join(client.videoDir!, "info.json")
  const videoPath = path.join(client.videoDir!, "video.mp4")

  const duration = (client.trackingData[client.trackingData.length - 1].timestamp - client.trackingData[0].timestamp) / 1000

  let videoInfo = {
    id: client.videoId,
    time: client.videoId,
    duration: duration ?? 0,
    averageFps: duration != null ? client.trackingData.length / duration : 0,
    path: videoPath.replace(/^.*?(\/data\/)/, '$1')
  } as Video

  try {
    fs.writeFileSync(infoPath, JSON.stringify(videoInfo, null, 2))
  } catch (err) {
    console.error(`Error saving video info: ${err}`)
  }
}