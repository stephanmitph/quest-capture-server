import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    // Get all collections
    const collections = await prisma.collection.findMany()

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

    // Generate ID from name
    const id = body.name.toLowerCase().replace(/\s+/g, "-")

    // Check if collection with this ID already exists
    const existingCollection = await prisma.collection.findUnique({
      where: { id },
    })

    if (existingCollection) {
      return NextResponse.json({ success: false, error: "Collection with this name already exists" }, { status: 409 })
    }

    // Create new collection
    const newCollection = await prisma.collection.create({
      data: {
        id,
        name: body.name,
        description: body.description,
        promptText: body.promptText,
        duration: body.duration,
      },
    })

    return NextResponse.json({
      success: true,
      data: newCollection,
    })
  } catch (error) {
    console.error("Error creating collection:", error)
    return NextResponse.json({ success: false, error: "Failed to create collection" }, { status: 500 })
  }
}

