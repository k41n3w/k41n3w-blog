"use client"

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function GiphyEmbed({ node }: NodeViewProps) {
  const { giphyId, src } = node.attrs
  const [isLoading, setIsLoading] = useState(true)
  const [gifUrl, setGifUrl] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!giphyId && !src) {
      setError("GIF inválido")
      setIsLoading(false)
      return
    }

    // Se temos um src direto, usamos ele
    if (src) {
      setGifUrl(src)
      setIsLoading(false)
      return
    }

    // Se temos um ID do Giphy, buscamos a URL direta da imagem
    if (giphyId) {
      // Usamos a URL direta do GIF em vez de tentar incorporar via iframe
      setGifUrl(`https://media.giphy.com/media/${giphyId}/giphy.gif`)

      // Simulamos um pequeno atraso para mostrar o loader
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [giphyId, src])

  if (error) {
    return (
      <NodeViewWrapper>
        <div className="bg-gray-800 border border-gray-700 rounded-md p-4 text-center text-gray-400">{error}</div>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper data-node-type="giphyEmbed" data-giphy-id={giphyId}>
      <div className="my-4 flex justify-center">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-red-500" />
            <span className="ml-2 text-gray-400">Carregando GIF...</span>
          </div>
        ) : (
          <div className="giphy-embed max-w-full overflow-hidden rounded-md">
            {gifUrl && (
              <img
                src={gifUrl || "/placeholder.svg"}
                alt="GIF"
                className="max-w-full h-auto rounded-md"
                onError={() => setError("Erro ao carregar o GIF")}
              />
            )}
            {giphyId && (
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
            )}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}
