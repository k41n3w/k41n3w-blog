"use client"

import { useEffect } from "react"
import hljs from "highlight.js"
// Remove the direct CSS import
// import "highlight.js/styles/vs2015.css"

export default function HighlightScript() {
  useEffect(() => {
    // Inicializar highlight.js
    hljs.configure({
      languages: [
        "ruby",
        "javascript",
        "typescript",
        "jsx",
        "tsx",
        "css",
        "scss",
        "bash",
        "json",
        "yaml",
        "markdown",
        "sql",
      ],
    })

    // Realçar todos os blocos de código na página
    hljs.highlightAll()

    // Registrar um MutationObserver para realçar novos blocos de código adicionados dinamicamente
    const observer = new MutationObserver(() => {
      hljs.highlightAll()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return null
}
