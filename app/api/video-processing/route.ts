import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    // Get all video processing jobs
    const jobs = await prisma.videoProcessingJob.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      data: jobs,
    })
  } catch (error) {
    console.error("Error fetching video processing jobs:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch video processing jobs" }, { status: 500 })
  }
}

