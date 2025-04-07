import AuthLayout from "@/components/auth-layout"
import { ApiTest } from "@/components/api-test"

export default function ApiTestPage() {
  return (
    <AuthLayout>
      <div className="p-6 flex justify-center">
        <ApiTest />
      </div>
    </AuthLayout>
  )
}

