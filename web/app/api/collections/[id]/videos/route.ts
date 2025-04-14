import { NextResponse } from "next/server"
import { getCollectionById, getVideosForCollection } from "@/shared/file-storage"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params

    // Check if collection exists
    const collection = await getCollectionById(id)

    if (!collection) {
      return NextResponse.json({ success: false, error: "Collection not found" }, { status: 404 })
    }

    // Get all videos for this collection
    const videos = await getVideosForCollection(id)

    // Return the videos as JSON
    return NextResponse.json({
      success: true,
      data: videos,
    })
  } catch (error) {
    console.error("Error fetching videos:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch videos" }, { status: 500 })
  }
}