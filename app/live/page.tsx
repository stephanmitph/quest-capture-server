import AuthLayout from "@/components/auth-layout"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Video } from "lucide-react"

const liveStreams = [
  { id: 1, name: "Stream 1" },
  { id: 2, name: "Stream 2" },
]

export default function LivePage() {
  return (
    <AuthLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Live Streams</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveStreams.map((stream) => (
            <div key={stream.id} className="border rounded-lg p-6 flex flex-col items-center">
              <Video className="w-16 h-16 mb-4" />
              <Link href={`/live/${stream.id}`}>
                <Button variant="default" className="bg-black text-white hover:bg-gray-800">
                  View
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </AuthLayout>
  )
}

