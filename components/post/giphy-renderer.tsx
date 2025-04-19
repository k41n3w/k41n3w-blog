"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

interface GiphyRendererProps {
  giphyId?: string
  src?: string
  alt?: string
}

export default function GiphyRenderer({ giphyId, src, alt }: GiphyRendererProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Determinar a URL do GIF
  const gifUrl = src || (giphyId ? `https://media.giphy.com/media/${giphyId}/giphy.gif` : "")

  // Extrair o ID do Giphy da URL, se não for fornecido diretamente
  const extractedId = !giphyId && gifUrl ? extractGiphyId(gifUrl) : giphyId

  if (!gifUrl) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-md p-4 text-center text-gray-400">
        GIF inválido: URL ou ID não fornecido
      </div>
    )
  }

  return (
    <div className="giphy-embed-container my-4 flex flex-col items-center">
      {isLoading && (
        <div className="flex justify-center items-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-red-500" />
          <span className="ml-2 text-gray-400">Carregando GIF...</span>
        </div>
      )}
      <img
        src={gifUrl || "/placeholder.svg"}
        alt={alt || "GIF do Giphy"}
        className="max-w-full h-auto rounded-md"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError("Erro ao carregar o GIF")
          setIsLoading(false)
        }}
        style={{ display: isLoading ? "none" : "block" }}
      />
      {error ? (
        <div className="text-red-400 text-sm mt-2">{error}</div>
      ) : (
        <div className="text-xs text-gray-500 text-center mt-1">
          <a
            href={extractedId ? `https://giphy.com/gifs/${extractedId}` : "https://giphy.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-red-400"
          >
            via GIPHY
          </a>
        </div>
      )}
    </div>
  )
}

// Função auxiliar para extrair o ID do Giphy de uma URL
function extractGiphyId(url: string): string | null {
  if (!url) return null

  try {
    // Tentar extrair o ID usando regex para diferentes formatos de URL
    const patterns = [
      /giphy\.com\/gifs\/([a-zA-Z0-9]+)/, // giphy.com/gifs/ID
      /giphy\.com\/gifs\/[a-zA-Z0-9]+-([a-zA-Z0-9]+)/, // giphy.com/gifs/SOURCE-ID
      /giphy\.com\/embed\/([a-zA-Z0-9]+)/, // giphy.com/embed/ID
      /media\.giphy\.com\/media\/([a-zA-Z0-9]+)/, // media.giphy.com/media/ID
      /i\.giphy\.com\/([a-zA-Z0-9]+)\.gif/, // i.giphy.com/ID.gif
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }

    // Se nenhum padrão corresponder, tentar extrair o último segmento da URL
    const urlObj = new URL(url)
    const pathSegments = urlObj.pathname.split("/").filter(Boolean)
    if (pathSegments.length > 0) {
      const lastSegment = pathSegments[pathSegments.length - 1]
      // Remover extensão .gif se presente
      return lastSegment.replace(/\.gif$/, "")
    }
  } catch (e) {
    console.error("Erro ao analisar URL do Giphy:", e)
  }

  return null
}
