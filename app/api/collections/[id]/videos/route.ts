import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const collectionId = params.id

    // Check if collection exists
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    })

    if (!collection) {
      return NextResponse.json({ success: false, error: "Collection not found" }, { status: 404 })
    }

    // Get all videos for this collection
    const videos = await prisma.video.findMany({
      where: { collectionId },
    })

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

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const collectionId = params.id
    const body = await request.json()

    // Check if collection exists
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    })

    if (!collection) {
      return NextResponse.json({ success: false, error: "Collection not found" }, { status: 404 })
    }

    // Validate request body
    if (!body.date || !body.time || !body.duration) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Generate a unique ID
    const id = `${Date.now()}`

    // Create new video
    const newVideo = await prisma.video.create({
      data: {
        id,
        date: body.date,
        time: body.time,
        duration: body.duration,
        collectionId,
      },
    })

    return NextResponse.json({
      success: true,
      data: newVideo,
    })
  } catch (error) {
    console.error("Error creating video:", error)
    return NextResponse.json({ success: false, error: "Failed to create video" }, { status: 500 })
  }
}

