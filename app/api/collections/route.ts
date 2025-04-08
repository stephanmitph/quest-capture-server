import { NextResponse } from "next/server"
import { getCollections, createCollection } from "@/capture/file-storage"

export async function GET(request: Request) {
  try {
    // Get all collections
    const collections = await getCollections()
    // Extract just the IDs
    const collectionIds = collections.map((collection) => collection.id)

    // Return the collection IDs as JSON
    return NextResponse.json({
      success: true,
      data: collectionIds,
    })
  } catch (error) {
    console.error("Error fetching collections:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch collections" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate request body
    if (!body.name || !body.description || !body.promptText || !body.duration) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Create new collection
    const newCollection = await createCollection({
      name: body.name,
      description: body.description,
      promptText: body.promptText,
      duration: body.duration,
    })

    if (!newCollection) {
      return NextResponse.json({ success: false, error: "Failed to create collection" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: newCollection,
    })
  } catch (error) {
    console.error("Error creating collection:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create collection"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

