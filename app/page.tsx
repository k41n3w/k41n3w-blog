"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"
import HighlightScript from "@/components/highlight-script"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Removendo o tema pré-definido do highlight.js para usar nosso CSS personalizado */}
        <style jsx global>{`
          /* Estilo base para highlight.js - fundo preto */
          .hljs {
            display: block;
            overflow-x: auto;
            padding: 1em;
            color: #d4d4d4;
            background: #000000;
          }
          
          /* Cores para diferentes elementos de sintaxe */
          .hljs-keyword { color: #c586c0; }
          .hljs-string { color: #ce9178; }
          .hljs-function { color: #dcdcaa; }
          .hljs-title { color: #dcdcaa; }
          .hljs-params { color: #9cdcfe; }
          .hljs-number { color: #b5cea8; }
          .hljs-comment { color: #6a9955; }
          .hljs-class { color: #4ec9b0; }
          .hljs-tag { color: #569cd6; }
          .hljs-attr { color: #9cdcfe; }
          .hljs-symbol { color: #b5cea8; }
          .hljs-meta { color: #569cd6; }
          .hljs-selector-tag { color: #d7ba7d; }
          .hljs-literal { color: #569cd6; }
          .hljs-built_in { color: #4ec9b0; }
          .hljs-name { color: #569cd6; }
          
          /* Garantir que não haja realce de fundo */
          .hljs *, pre *, code * {
            background: #000000 !important;
          }
        `}</style>
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
