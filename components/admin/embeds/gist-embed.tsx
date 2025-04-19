"use client"

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react"
import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"

export default function GistEmbed({ node }: NodeViewProps) {
  const { gistId, filename } = node.attrs
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const scriptLoadedRef = useRef(false)

  useEffect(() => {
    if (!gistId) {
      setError("ID do Gist inválido")
      setIsLoading(false)
      return
    }

    // Limpar qualquer conteúdo anterior
    if (containerRef.current) {
      containerRef.current.innerHTML = ""
    }

    const scriptId = `gist-${gistId}`

    // Remover script anterior se existir
    const existingScript = document.getElementById(scriptId)
    if (existingScript) {
      existingScript.remove()
    }

    // Criar o script para carregar o Gist
    const script = document.createElement("script")
    script.id = scriptId
    script.src = `https://gist.github.com/${gistId}.js`
    if (filename) {
      script.src += `?file=${encodeURIComponent(filename)}`
    }
    script.async = true

    // Definir handlers para sucesso e erro
    script.onload = () => {
      console.log("Gist script loaded successfully")
      scriptLoadedRef.current = true
      setIsLoading(false)
    }

    script.onerror = () => {
      console.error("Failed to load Gist script")
      setError("Falha ao carregar o Gist")
      setIsLoading(false)
    }

    // Adicionar o script ao container
    if (containerRef.current) {
      containerRef.current.appendChild(script)
    }

    // Definir um timeout para evitar carregamento infinito
    const timeout = setTimeout(() => {
      if (isLoading && !scriptLoadedRef.current) {
        setError("Tempo limite excedido ao carregar o Gist")
        setIsLoading(false)
      }
    }, 10000) // 10 segundos de timeout

    return () => {
      clearTimeout(timeout)
      // Limpar o script quando o componente for desmontado
      if (document.getElementById(scriptId)) {
        document.getElementById(scriptId)?.remove()
      }
    }
  }, [gistId, filename, isLoading])

  if (error) {
    return (
      <NodeViewWrapper>
        <div className="bg-gray-800 border border-gray-700 rounded-md p-4 text-center text-red-400">{error}</div>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper data-type="gist-embed" data-gist-id={gistId} data-filename={filename || ""}>
      <div className="my-4 relative">
        {isLoading && (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-red-500" />
            <span className="ml-2 text-gray-400">Carregando Gist...</span>
          </div>
        )}
        <div ref={containerRef} className="gist-embed"></div>
      </div>
    </NodeViewWrapper>
  )
}
