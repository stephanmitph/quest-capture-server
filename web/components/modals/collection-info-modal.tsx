"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Collection } from "@/lib/collections-context"
import { formatDate } from "@/lib/utils"

interface CollectionInfoModalProps {
  isOpen: boolean
  onClose: () => void
  collection: Collection | null
}

export function CollectionInfoModal({ isOpen, onClose, collection }: CollectionInfoModalProps) {
  if (!collection) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{collection.name}</DialogTitle>
          <DialogDescription>Collection details and information</DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="mt-1">{collection.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Prompt Text</h3>
            <p className="mt-1">{collection.promptText}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Video Duration</h3>
              <p className="mt-1">{collection.duration} seconds</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Videos</h3>
              <p className="mt-1">{collection.videos.length} videos</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Created</h3>
            <p className="mt-1">{formatDate(collection.createdAt)}</p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

