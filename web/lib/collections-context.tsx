"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Collection, Video } from "@/shared/file-storage"

type CollectionsContextType = {
  collections: Collection[]
  addCollection: (collection: Omit<Collection, "id" | "createdAt" | "videos">) => Promise<Collection>
  getCollection: (id: number) => Collection | undefined
  refreshCollections: () => Promise<void>
}

const CollectionsContext = createContext<CollectionsContextType | undefined>(undefined)

export function CollectionsProvider({ children }: { children: React.ReactNode }) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch collections from API
  const fetchCollections = async () => {
    try {
      // First get all collection IDs
      const idsResponse = await fetch("/api/collections")
      const idsData = await idsResponse.json()

      if (!idsData.success) {
        throw new Error(idsData.error || "Failed to fetch collection IDs")
      }

      const collectionIds = idsData.data

      // Then fetch details for each collection
      const collectionsData = await Promise.all(
        collectionIds.map(async (id: string) => {
          const response = await fetch(`/api/collections/${id}`)
          const data = await response.json()

          if (!data.success) {
            console.error(`Failed to fetch collection ${id}: ${data.error}`)
            return null
          }

          return data.data
        }),
      )

      // Filter out any failed requests
      const validCollections = collectionsData.filter(Boolean)
      setCollections(validCollections)
    } catch (error) {
      console.error("Error fetching collections:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCollections()
  }, [])

  const addCollection = async (collectionData: Omit<Collection, "id" | "createdAt" | "videos">) => {
    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(collectionData),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to create collection")
      }

      const newCollection = data.data

      // Update local state
      setCollections((prev) => [...prev, newCollection])

      return newCollection
    } catch (error) {
      console.error("Error creating collection:", error)
      throw error
    }
  }

  const getCollection = (id: number) => {
    return collections.find((collection) => collection.id == id)
  }

  const refreshCollections = async () => {
    await fetchCollections()
  }

  return (
    <CollectionsContext.Provider
      value={{
        collections,
        addCollection,
        getCollection,
        refreshCollections,
      }}
    >
      {children}
    </CollectionsContext.Provider>
  )
}

export function useCollections() {
  const context = useContext(CollectionsContext)
  if (context === undefined) {
    throw new Error("useCollections must be used within a CollectionsProvider")
  }
  return context
}

export type { Collection, Video }

