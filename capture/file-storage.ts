import * as fs from "fs"
import * as path from "path"
import { promisify } from "util"

// Convert callback-based fs functions to Promise-based
const readdir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)
const stat = promisify(fs.stat)

// Base paths
const DATA_DIR = path.join(process.cwd(), "data")
const DEFAULT_COLLECTION = path.join(DATA_DIR, "default")

// Ensure directories exist
export function ensureDirectoriesExist() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(DEFAULT_COLLECTION)) {
    fs.mkdirSync(DEFAULT_COLLECTION, { recursive: true })
  }
}

// Collection types
export interface Collection {
  id: string
  name: string
  description: string
  promptText: string
  duration: string
  createdAt: string
  videos: Video[]
}

export interface Video {
  id: string
  date: string
  time: string
  duration: string
  path?: string
  collectionId: string
}

// Collection operations
export async function getCollections(): Promise<Collection[]> {
  ensureDirectoriesExist()

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

        // Get videos for this collection
        collection.videos = await getVideosForCollection(collection.id)

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

export async function getCollectionById(id: string): Promise<Collection | null> {
  ensureDirectoriesExist()

  try {
    const collectionPath = path.join(DATA_DIR, id)
    const infoPath = path.join(collectionPath, "info.json")

    if (!fs.existsSync(infoPath)) {
      return null
    }

    const infoData = await readFile(infoPath, "utf8")
    const collection = JSON.parse(infoData) as Collection

    // Get videos for this collection
    collection.videos = await getVideosForCollection(id)

    return collection
  } catch (error) {
    console.error(`Error getting collection ${id}:`, error)
    return null
  }
}

export async function createCollection(
  collectionData: Omit<Collection, "id" | "createdAt" | "videos">,
): Promise<Collection | null> {
  ensureDirectoriesExist()

  try {
    // Generate ID from name
    const id = collectionData.name.toLowerCase().replace(/\s+/g, "-")
    const collectionPath = path.join(DATA_DIR, id)

    // Check if collection already exists
    if (fs.existsSync(collectionPath)) {
      throw new Error("Collection with this name already exists")
    }

    // Create collection directory
    await mkdir(collectionPath, { recursive: true })

    // Create collection info
    const collection: Collection = {
      id,
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
export async function getVideosForCollection(collectionId: string): Promise<Video[]> {
  try {
    const collectionPath = path.join(DATA_DIR, collectionId)
    const videosPath = path.join(collectionPath, "videos")

    if (!fs.existsSync(videosPath)) {
      return []
    }

    const videoDirs = await readdir(videosPath)

    const videos = await Promise.all(
      videoDirs.map(async (dir) => {
        const videoPath = path.join(videosPath, dir)
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

export async function createVideoDirectory(
  collectionId: string | "default",
): Promise<{videoId: string, directory: string} | null> {
  try {
    // Generate a unique ID
    const videoId = `${Date.now()}`
    const collectionPath = path.join(DATA_DIR, collectionId)
    const videoPath = path.join(collectionPath, videoId)

    // Check if collection exists
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

// Initialize with sample data if needed
export async function initializeWithSampleData() {
  ensureDirectoriesExist()

  // Check if collections directory is empty
  const collections = await readdir(DATA_DIR)
  if (collections.length === 0) {
    console.log("Initializing with sample data...")

    // Create sample collections
    const sportCollection = await createCollection({
      name: "Sport",
      description: "Collection of various sports activities",
      promptText: "Sports activities",
      duration: "30",
    })

    const readingCollection = await createCollection({
      name: "Reading",
      description: "Collection of reading activities",
      promptText: "Reading activities",
      duration: "30",
    })

    console.log("Sample data initialized")
  }
}

// Get paths
export function getCollectionDir(collectionId: string) {
  ensureDirectoriesExist()
  return path.join(DATA_DIR, collectionId)
}

