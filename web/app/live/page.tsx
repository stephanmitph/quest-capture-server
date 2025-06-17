import AuthLayout from "@/components/auth-layout"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Video } from "lucide-react"

const liveStreams = [
  { id: 1, name: "Stream 1" },
]

export default function LivePage() {
  return (
    <AuthLayout>
      <div className="p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Live Streams</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {liveStreams.map((stream) => (
            <div key={stream.id} className="border rounded-lg p-4 md:p-6 flex flex-col items-center">
              <Video className="w-12 h-12 md:w-16 md:h-16 mb-4" />
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

