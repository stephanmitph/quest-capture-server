"use client"

import { useState, useEffect } from "react"
import AuthLayout from "@/components/auth-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import Link from "next/link"

interface VideoProcessingJob {
  id: string
  clientId: number
  collectionId: string
  status: string
  createdAt: string
  updatedAt: string
  error?: string
  videoId?: string
}

export default function VideoProcessingPage() {
  const [jobs, setJobs] = useState<VideoProcessingJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchJobs = async () => {
    setRefreshing(true)
    setError(null)

    try {
      const response = await fetch("/api/video-processing")

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setJobs(data.data)
      } else {
        throw new Error(data.error || "Failed to fetch video processing jobs")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600"
      case "failed":
        return "text-red-600"
      case "processing":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <AuthLayout>
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-sm text-gray-500">Processing</h2>
            <h1 className="text-2xl font-bold">Video Processing Jobs</h1>
          </div>
          <Button variant="outline" size="sm" onClick={fetchJobs} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Processing Jobs</CardTitle>
            <CardDescription>View the status of video processing jobs from Unity streams</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : error ? (
              <div className="p-3 bg-red-50 text-red-700 rounded-md">{error}</div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-4">No video processing jobs found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Collection</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-mono text-xs">{job.id}</TableCell>
                      <TableCell>{job.collectionId}</TableCell>
                      <TableCell className={getStatusColor(job.status)}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </TableCell>
                      <TableCell>{formatDate(job.createdAt)}</TableCell>
                      <TableCell>{formatDate(job.updatedAt)}</TableCell>
                      <TableCell>
                        {job.status === "completed" && job.videoId && (
                          <Link href={`/collections/${job.collectionId}/video/${job.videoId}`}>
                            <Button variant="outline" size="sm">
                              View Video
                            </Button>
                          </Link>
                        )}
                        {job.status === "failed" && <span className="text-xs text-red-500">{job.error}</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  )
}

