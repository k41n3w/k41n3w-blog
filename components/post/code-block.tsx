"use client"

import { useEffect, useRef, useState } from "react"
import { Clipboard, Check } from "lucide-react"
import hljs from "highlight.js"

interface CodeBlockProps {
  code: string
  language: string
  filename?: string
}

export default function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null)
  const [copied, setCopied] = useState(false)

  // Mapear nomes de linguagem comuns para os identificadores do highlight.js
  const languageMap: Record<string, string> = {
    rb: "ruby",
    js: "javascript",
    ts: "typescript",
    jsx: "javascript", // highlight.js usa javascript para jsx
    tsx: "typescript", // highlight.js usa typescript para tsx
    css: "css",
    scss: "scss",
    sh: "bash",
    bash: "bash",
    json: "json",
    yml: "yaml",
    yaml: "yaml",
    md: "markdown",
    sql: "sql",
  }

  // Obter o identificador de linguagem correto
  const highlightLanguage = languageMap[language?.toLowerCase()] || language || "ruby"

  useEffect(() => {
    // Highlight the code when the component mounts
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current)

      // Remover qualquer elemento mark que possa estar causando o realce em preto
      const markElements = codeRef.current.querySelectorAll("mark")
      markElements.forEach((mark) => {
        const parent = mark.parentNode
        if (parent) {
          // Substituir o elemento mark pelo seu conteúdo
          while (mark.firstChild) {
            parent.insertBefore(mark.firstChild, mark)
          }
          parent.removeChild(mark)
        }
      })
    }
  }, [code, language])

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  return (
    <div className="code-block-wrapper my-6 rounded-md overflow-hidden">
      <div className="code-block-header px-4 py-2 flex justify-between items-center bg-gray-800 border-b border-gray-700">
        {filename && <span className="text-sm text-gray-300">{filename}</span>}
        <div className="flex items-center">
          <span className="text-xs text-gray-400 mr-2">{highlightLanguage}</span>
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
            title="Copiar código"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4 text-gray-400" />}
          </button>
        </div>
      </div>
      <pre className="bg-gray-900 p-4 overflow-x-auto m-0">
        <code ref={codeRef} className={`language-${highlightLanguage} no-highlight-marks`}>
          {code}
        </code>
      </pre>
    </div>
  )
}
