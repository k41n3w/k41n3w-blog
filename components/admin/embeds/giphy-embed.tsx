"use client"

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function GiphyEmbed({ node }: NodeViewProps) {
  const { giphyId, src } = node.attrs
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular um pequeno atraso para mostrar o loader
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (!giphyId && !src) {
    return (
      <NodeViewWrapper>
        <div className="bg-gray-800 border border-gray-700 rounded-md p-4 text-center text-gray-400">GIF inválido</div>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper>
      <div className="my-4 flex justify-center">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-red-500" />
            <span className="ml-2 text-gray-400">Carregando GIF...</span>
          </div>
        ) : (
          <div className="giphy-embed max-w-full overflow-hidden rounded-md">
            {giphyId ? (
              <iframe
                src={`https://giphy.com/embed/${giphyId}`}
                width="480"
                height="360"
                frameBorder="0"
                className="giphy-embed"
                allowFullScreen
              ></iframe>
            ) : (
              <img src={src || "/placeholder.svg"} alt="GIF" className="max-w-full h-auto" />
            )}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}
