"use client"

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react"
import { useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"

export default function GistEmbed({ node }: NodeViewProps) {
  const { gistId, filename } = node.attrs
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptLoaded = useRef(false)

  useEffect(() => {
    if (!gistId || scriptLoaded.current) return

    const scriptId = `gist-${gistId}`
    // Verificar se o script já existe
    if (document.getElementById(scriptId)) return

    // Criar o script para carregar o Gist
    const script = document.createElement("script")
    script.id = scriptId
    script.src = `https://gist.github.com/${gistId}.js`
    if (filename) {
      script.src += `?file=${encodeURIComponent(filename)}`
    }
    script.async = true

    // Adicionar o script ao container
    if (containerRef.current) {
      containerRef.current.innerHTML = ""
      containerRef.current.appendChild(script)
      scriptLoaded.current = true
    }

    return () => {
      // Limpar o script quando o componente for desmontado
      if (document.getElementById(scriptId)) {
        document.getElementById(scriptId)?.remove()
      }
      scriptLoaded.current = false
    }
  }, [gistId, filename])

  if (!gistId) {
    return (
      <NodeViewWrapper>
        <div className="bg-gray-800 border border-gray-700 rounded-md p-4 text-center text-gray-400">Gist inválido</div>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper>
      <div className="my-4 relative">
        <div ref={containerRef} className="gist-embed">
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-red-500" />
            <span className="ml-2 text-gray-400">Carregando Gist...</span>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  )
}
