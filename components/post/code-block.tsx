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

  // Map common language names to highlight.js identifiers
  const languageMap: Record<string, string> = {
    rb: "ruby",
    js: "javascript",
    ts: "typescript",
    jsx: "javascript",
    tsx: "typescript",
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

  // Get the correct language identifier
  const highlightLanguage = languageMap[language?.toLowerCase()] || language || "ruby"

  // Log for debugging
  console.log("CodeBlock rendering with:", { code, language, filename })

  useEffect(() => {
    // Highlight the code when the component mounts
    if (codeRef.current && code) {
      try {
        hljs.highlightElement(codeRef.current)
      } catch (error) {
        console.error("Error highlighting code:", error)
      }
    }
  }, [code, language])

  const handleCopy = () => {
    if (navigator.clipboard && code) {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  // If there's no code, show a friendly message
  if (!code || code.trim() === "") {
    return (
      <div className="code-block-wrapper my-6 rounded-md overflow-hidden w-full max-w-full">
        <div className="code-block-header px-4 py-2 flex justify-between items-center bg-gray-800 border-b border-gray-700 flex-wrap">
          {filename && <span className="text-sm text-gray-300 break-all">{filename}</span>}
          {!filename && <span className="text-xs text-gray-400">{highlightLanguage}</span>}
        </div>
        <div className="bg-gray-900 p-4 text-gray-400 text-sm">// Código não disponível</div>
      </div>
    )
  }

  return (
    <div className="code-block-wrapper my-6 rounded-md overflow-hidden w-full max-w-full">
      <div className="code-block-header px-4 py-2 flex justify-between items-center bg-gray-800 border-b border-gray-700 flex-wrap">
        {filename && <span className="text-sm text-gray-300 break-all">{filename}</span>}
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
      <div className="bg-gray-900 p-0 m-0 w-full max-w-full overflow-x-auto">
        <pre className="p-4 m-0 overflow-x-auto w-full">
          <code ref={codeRef} className={`language-${highlightLanguage}`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  )
}
