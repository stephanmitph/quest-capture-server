"use client"

import type React from "react"

import { useParams, useRouter } from "next/navigation"
import AuthLayout from "@/components/auth-layout"
import Link from "next/link"
import { Film, MoreVertical } from "lucide-react"
import { useCollections, type Collection, type Video } from "@/lib/collections-context"
import { useEffect, useState } from "react"
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/breadcrumbs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CollectionInfoModal } from "@/components/modals/collection-info-modal"

export default function CollectionPage() {
  const params = useParams()
  const router = useRouter()
  const collectionId = params.id
  const { getCollection } = useCollections()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)

  useEffect(() => {
    const id = parseInt(collectionId as string, 10)
    const collectionData = getCollection(id)
    if (collectionData) {
      setCollection(collectionData)
    } else {
      // If collection doesn't exist, redirect to collections page
      router.push("/collections")
    }
  }, [collectionId, getCollection, router])

  if (!collection) {
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

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Collections", href: "/collections" },
    { label: collection.name, href: `/collections/${collection.id}` },
  ]

  const handleMoreClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleInfoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsInfoModalOpen(true)
  }

  return (
    <AuthLayout>
      <div className="p-4 md:p-6">
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold">Video Collections</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={handleMoreClick}>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleInfoClick}>More info</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {collection.videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {collection.videos.map((video: Video) => (
              <Link href={`/collections/${collectionId}/video/${video.id}`} key={video.id}>
                <div className="border rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow relative">
                  <button className="absolute top-2 right-2 md:top-4 md:right-4 text-gray-500">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  <div className="flex justify-center mb-4 md:mb-6">
                    <Film className="w-12 h-12 md:w-16 md:h-16" />
                  </div>
                  <h3 className="text-lg font-bold">{`${video.time}`}</h3>
                  <p className="text-sm text-gray-500">{new Date(parseInt(video.time)).toUTCString()}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl">No videos in this collection yet</h2>
            <p className="text-gray-500 mt-2">Videos will appear here once they are created</p>
          </div>
        )}

        <CollectionInfoModal
          isOpen={isInfoModalOpen}
          onClose={() => setIsInfoModalOpen(false)}
          collection={collection}
        />
      </div>
    </AuthLayout>
  )
}

