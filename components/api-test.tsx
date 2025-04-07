"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ApiTest() {
  const [collectionIds, setCollectionIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCollectionIds = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/collections")

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setCollectionIds(data.data)
      } else {
        throw new Error(data.error || "Failed to fetch collection IDs")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>API Test</CardTitle>
        <CardDescription>Test the collections API endpoint</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={fetchCollectionIds} disabled={loading} className="w-full">
            {loading ? "Loading..." : "Fetch Collection IDs"}
          </Button>

          {error && <div className="p-3 bg-red-50 text-red-700 rounded-md">{error}</div>}

          {collectionIds.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-md">
              <h3 className="font-medium mb-2">Collection IDs:</h3>
              <ul className="list-disc pl-5">
                {collectionIds.map((id) => (
                  <li key={id}>{id}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

