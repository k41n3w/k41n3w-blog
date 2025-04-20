import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"
import HighlightScript from "@/components/highlight-script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ruby on Rails Tech Blog",
  description: "Insights from a Rails Tech Lead",
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
        <Suspense>
          {children}
          <Analytics />
          <HighlightScript />
        </Suspense>
      </body>
    </html>
  )
}
