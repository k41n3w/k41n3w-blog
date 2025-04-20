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
      <head>
        {/* Mudando para um tema diferente que não tem o problema de realce em preto */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css"
          integrity="sha512-Jk4AqjWsdSzSNJwO9WysJy+TUE3gdQX4GUvXI0OrCwBPn1Ot9OcOuCimN3WLnXazkigUlavC6EvU14TRiUQ8g=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
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
