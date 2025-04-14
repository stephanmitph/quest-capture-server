"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import AuthLayout from "@/components/auth-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Video, Rewind } from "lucide-react"
import { useCollections } from "@/lib/collections-context"
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/breadcrumbs"

export default function VideoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const collectionId = params.id as string
  const videoId = params.videoId as string

  const [selectedModel, setSelectedModel] = useState<string>("")
  const { getCollection } = useCollections()
  const [collection, setCollection] = useState<any>(null)
  const [video, setVideo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch collection details
        const response = await fetch(`/api/collections/${collectionId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch collection")
        }

        const data = await response.json()
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch collection")
        }

        const collectionData = data.data
        setCollection(collectionData)

        // Find the video in the collection
        const videoData = collectionData.videos.find((v: any) => v.id === videoId)
        if (!videoData) {
          router.push(`/collections/${collectionId}`)
          return
        }

        setVideo(videoData)
      } catch (error) {
        console.error("Error fetching data:", error)
        router.push("/collections")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [collectionId, videoId, router])

  if (loading) {
    return (
      <AuthLayout>
        <div className="p-4 md:p-6">
          <div className="text-center py-12">
            <h2 className="text-xl">Loading...</h2>
          </div>
        </div>
      </AuthLayout>
    )
  }

  if (!collection || !video) {
    return (
      <AuthLayout>
        <div className="p-4 md:p-6">
          <div className="text-center py-12">
            <h2 className="text-xl">Video not found</h2>
          </div>
        </div>
      </AuthLayout>
    )
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Collections", href: "/collections" },
    { label: collection.name, href: `/collections/${collection.id}` },
  ]

  return (
    <AuthLayout>
      <div className="p-4 md:p-6">
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
          <h1 className="text-xl md:text-2xl font-bold">
            Video {video.date} {video.time}
          </h1>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-full max-w-4xl border rounded-lg p-4 md:p-6 mb-4 aspect-video flex items-center justify-center">
            {video.path ? (
              <video className="w-full h-full" controls src={video.path}>
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="relative">
                <Video className="w-24 h-24 md:w-32 md:h-32" />
                <div className="absolute bottom-0 left-0 p-2">
                  <Rewind className="w-5 h-5 md:w-6 md:h-6" />
                </div>
              </div>
            )}
          </div>

          <div className="w-full max-w-4xl flex justify-end">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="model1">Model 1</SelectItem>
                <SelectItem value="model2">Model 2</SelectItem>
                <SelectItem value="model3">Model 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}

