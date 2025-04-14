"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import AuthLayout from "@/components/auth-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Video } from "lucide-react"

export default function LiveStreamPage() {
  const { id } = useParams()
  const [selectedModel, setSelectedModel] = useState<string>("")

  return (
    <AuthLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Live</h1>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-full max-w-4xl border rounded-lg p-6 mb-4 aspect-video flex items-center justify-center">
            <Video className="w-32 h-32" />
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

