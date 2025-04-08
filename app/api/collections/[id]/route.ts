import { NextResponse } from "next/server"
import { getCollectionById } from "@/capture/file-storage"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params

    // Get the collection by ID with its videos
    const collection = await getCollectionById(id)

    if (!collection) {
      return NextResponse.json({ success: false, error: "Collection not found" }, { status: 404 })
    }

    // Return the collection as JSON
    return NextResponse.json({
      success: true,
      data: collection,
    })
  } catch (error) {
    console.error("Error fetching collection:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch collection" }, { status: 500 })
  }
}

