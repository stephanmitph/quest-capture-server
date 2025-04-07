import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Get the video processing job by ID
    const job = await prisma.videoProcessingJob.findUnique({
      where: { id },
    })

    if (!job) {
      return NextResponse.json({ success: false, error: "Video processing job not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: job,
    })
  } catch (error) {
    console.error("Error fetching video processing job:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch video processing job" }, { status: 500 })
  }
}

