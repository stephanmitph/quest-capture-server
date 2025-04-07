"use client"

import type React from "react"

import { useState } from "react"
import AuthLayout from "@/components/auth-layout"
import Link from "next/link"
import { Folder, Plus, MoreVertical, RefreshCw } from "lucide-react"
import { CreateCollectionModal } from "@/components/modals/create-collection-modal"
import { CollectionInfoModal } from "@/components/modals/collection-info-modal"
import { useCollections, type Collection } from "@/lib/collections-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export default function CollectionsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { collections, refreshCollections } = useCollections()

  const handleMoreClick = (e: React.MouseEvent, collection: Collection) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleInfoClick = (e: React.MouseEvent, collection: Collection) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedCollection(collection)
    setIsInfoModalOpen(true)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshCollections()
    setIsRefreshing(false)
  }

  return (
    <AuthLayout>
      <div className="p-4 md:p-6">
        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-sm text-gray-500">Collections</h2>
            <h1 className="text-2xl font-bold">Video Collections</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Dynamic Collections */}
          {collections.map((collection) => (
            <div key={collection.id} className="relative">
              <Link href={`/collections/${collection.id}`}>
                <div className="border rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow relative">
                  <div className="absolute top-2 right-2 md:top-4 md:right-4 text-gray-500 z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => handleMoreClick(e, collection)}>
                        <button>
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => handleInfoClick(e, collection)}>More info</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex justify-center mb-4 md:mb-6">
                    <Folder className="w-12 h-12 md:w-16 md:h-16" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold">{collection.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{collection.description}</p>
                </div>
              </Link>
            </div>
          ))}

          {/* Create New Collection */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="border rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow border-dashed flex flex-col items-center justify-center"
          >
            <div className="flex justify-center mb-4 md:mb-6">
              <div className="relative">
                <Folder className="w-12 h-12 md:w-16 md:h-16" />
                <Plus className="w-5 h-5 md:w-6 md:h-6 absolute bottom-0 right-0 bg-white rounded-full" />
              </div>
            </div>
            <h3 className="text-lg md:text-xl font-bold">Create a new collection</h3>
          </button>
        </div>

        <CreateCollectionModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

        <CollectionInfoModal
          isOpen={isInfoModalOpen}
          onClose={() => setIsInfoModalOpen(false)}
          collection={selectedCollection}
        />
      </div>
    </AuthLayout>
  )
}

