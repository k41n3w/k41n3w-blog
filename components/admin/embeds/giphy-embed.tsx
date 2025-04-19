"use client"

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function GiphyEmbed({ node }: NodeViewProps) {
  const { giphyId } = node.attrs
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Simular um pequeno atraso para mostrar o loader
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [giphyId])

  if (!giphyId) {
    return (
      <NodeViewWrapper>
        <div className="bg-gray-800 border border-gray-700 rounded-md p-4 text-center text-gray-400">
          GIF inválido: ID não fornecido
        </div>
      </NodeViewWrapper>
    )
  }

  if (error) {
    return (
      <NodeViewWrapper>
        <div className="bg-gray-800 border border-gray-700 rounded-md p-4 text-center text-gray-400">{error}</div>
      </NodeViewWrapper>
    )
  }

  // Construir a URL direta para o GIF
  const gifUrl = `https://media.giphy.com/media/${giphyId}/giphy.gif`

  return (
    <NodeViewWrapper className="giphy-embed-wrapper" data-giphy-id={giphyId}>
      <div className="my-4 flex flex-col items-center">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-red-500" />
            <span className="ml-2 text-gray-400">Carregando GIF...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <img
              src={gifUrl || "/placeholder.svg"}
              alt="GIF do Giphy"
              className="max-w-full h-auto rounded-md"
              onError={() => setError("Erro ao carregar o GIF")}
            />
            <div className="text-xs text-gray-500 text-center mt-1">
              <a
                href={`https://giphy.com/gifs/${giphyId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-400"
              >
                via GIPHY
              </a>
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}
