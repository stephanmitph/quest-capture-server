import * as fs from "fs"
import { get } from "http"
import * as path from "path"
import { promisify } from "util"

// Convert callback-based fs functions to Promise-based
const readdir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)
const stat = promisify(fs.stat)

// Base paths
const DATA_DIR = process.env.ABSOLUTE_DATA_PATH!
const DEFAULT_COLLECTION = path.join(DATA_DIR, "default")

// Ensure directories exist
export async function ensureDirectoriesExist() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(DEFAULT_COLLECTION)) {
    await createCollection({
      name: "Default",
      description: "Default collection for videos",
      promptText: "Default collection for videos",
      duration: 30,
    })
  }
}

// Collection types
export interface Collection {
  id: number
  folderName: string
  name: string
  description: string
  promptText: string
  duration: number
  createdAt: string
  videos?: Video[]
}

export interface Video {
  id: string
  time: string
  duration: number
  averageFps: number
  path?: string
}

// Collection operations
export async function getCollections(): Promise<Collection[]> {
  try {
    const collectionDirs = await readdir(DATA_DIR)
    const collections = await Promise.all(
      collectionDirs.map(async (dir) => {
        const collectionPath = path.join(DATA_DIR, dir)
        const infoPath = path.join(collectionPath, "info.json")

        // Check if it's a directory and has info.json
        const stats = await stat(collectionPath)
        if (!stats.isDirectory() || !fs.existsSync(infoPath)) {
          return null
        }

        // Read collection info
        const infoData = await readFile(infoPath, "utf8")
        const collection = JSON.parse(infoData) as Collection

        return collection
      }),
    )

    // Filter out null values and return
    return collections.filter(Boolean) as Collection[]
  } catch (error) {
    console.error("Error getting collections:", error)
    return []
  }
}

export async function getCollectionById(id: number): Promise<Collection | null> {
  try {
    const collections = await getCollections()
    const collection = collections.find((c) => c.id == id)

    if (!collection) {
      return null
    }

    // Get videos for this collection
    collection.videos = await getVideosForCollection(id)

    return collection
  } catch (error) {
    console.error(`Error getting collection ${id}:`, error)
    return null
  }
}

export async function createCollection(
  collectionData: Omit<Collection, "id" | "folderName" | "createdAt" | "videos">,
): Promise<Collection | null> {
  try {
    // Generate a unique ID and folder name
    // Id is max id + 1
    const collections = await getCollections()
    const id = collections.length == 0 ? 0 : collections.map((c) => c.id).reduce((a, b) => Math.max(a, b) + 1, 0);
    const folderName = collectionData.name.toLowerCase().replace(/\s+/g, "-")
    const collectionPath = path.join(DATA_DIR, folderName)

    // Check if collection already exists
    if (fs.existsSync(collectionPath)) {
      throw new Error("Collection with this name already exists")
    }

    // Create collection directory
    await mkdir(collectionPath, { recursive: true })

    // Create collection info
    const collection: Collection = {
      id,
      folderName,
      ...collectionData,
      createdAt: new Date().toISOString(),
      videos: [],
    }

    // Write collection info to file
    await writeFile(path.join(collectionPath, "info.json"), JSON.stringify(collection, null, 2), "utf8")

    return collection
  } catch (error) {
    console.error("Error creating collection:", error)
    return null
  }
}

// Video operations
export async function getVideosForCollection(collectionId: number): Promise<Video[]> {
  try {
    const collection = (await getCollections()).find((c) => c.id == collectionId)

    if (!collection) return []

    const collectionPath = path.join(DATA_DIR, collection.folderName)
    if (!fs.existsSync(collectionPath)) {
      return []
    }

    const videoDirs = await readdir(collectionPath)

    const videos = await Promise.all(
      videoDirs.map(async (dir) => {
        const videoPath = path.join(collectionPath, dir)
        const infoPath = path.join(videoPath, "info.json")

        // Check if it's a directory and has info.json
        const stats = await stat(videoPath)
        if (!stats.isDirectory() || !fs.existsSync(infoPath)) {
          return null
        }
        // Read video info
        const infoData = await readFile(infoPath, "utf8")
        return JSON.parse(infoData) as Video
      }),
    )

    // Filter out null values and return
    return videos.filter(Boolean) as Video[]
  } catch (error) {
    console.error(`Error getting videos for collection ${collectionId}:`, error)
    return []
  }
}

export async function createVideoDirectory(collectionId: number): Promise<{ videoId: string, directory: string } | null> {
  try {
    // Generate a unique ID
    const videoId = `${Date.now()}`
    const collections = await getCollections()
    const collection = collections.find((c) => c.id == collectionId)

    if (!collection) {
      throw new Error("Collection not found")
    }

    const collectionPath = path.join(DATA_DIR, collection.folderName)
    const videoPath = path.join(collectionPath, videoId)

    if (!fs.existsSync(collectionPath)) {
      throw new Error("Collection not found")
    }

    // Create video directory
    await mkdir(videoPath, { recursive: true })
    return { videoId: videoId, directory: videoPath }
  } catch (error) {
    console.error("Error creating video:", error)
    return null
  }
}
