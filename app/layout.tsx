import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"
import HighlightScript from "@/components/highlight-script"
import { generateBaseMetadata } from "@/lib/seo/metadata"

const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Melhora a performance de carregamento de fontes
  variable: "--font-inter",
})

// Gerar metadados base para o site
export const metadata: Metadata = generateBaseMetadata()

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="overflow-x-hidden">
      <head>
        {/* Adicionar meta viewport para garantir comportamento responsivo adequado */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />

        {/* Mudando para um tema diferente que não tem o problema de realce em preto - removendo integrity */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        {/* Adicionar estilo inline para garantir que não haja realces de fundo */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
    pre code, .hljs {
      background-color: #1e1e1e !important;
    }
    pre code *, .hljs * {
      background-color: transparent !important;
    }
    /* Prevenir overflow horizontal */
    html, body {
      overflow-x: hidden;
      width: 100%;
      position: relative;
    }
  `,
          }}
        />
        {/* Preconnect para recursos externos */}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased overflow-x-hidden`}>
        <Suspense>
          {children}
          <Analytics />
          <HighlightScript />
        </Suspense>
      </body>
    </html>
  )
}
