import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import { CollectionsProvider } from "@/lib/collections-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Quest Capture Server",
  description: "Video streaming application",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <AuthProvider>
            <CollectionsProvider>{children}</CollectionsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}