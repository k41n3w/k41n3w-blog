"use client"

import { useEffect } from "react"
import hljs from "highlight.js"

export default function HighlightScript() {
  useEffect(() => {
    // Carregar o CSS do highlight.js dinamicamente
    const linkElement = document.createElement("link")
    linkElement.rel = "stylesheet"
    linkElement.href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
    linkElement.integrity =
      "sha512-rO+olRTkcf304DQBxSWxln8JXCzTHlKnIdnMUwYvQa9/Jd4cQaNkItIUj6Z4nvW1dqK0SKXLbn9h4KwZTNtAyw=="
    linkElement.crossOrigin = "anonymous"
    linkElement.referrerPolicy = "no-referrer"
    document.head.appendChild(linkElement)

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

    // Função para aplicar realce e remover elementos mark
    const applyHighlighting = () => {
      // Realçar todos os blocos de código na página
      hljs.highlightAll()

      // Remover qualquer elemento mark que possa estar causando o realce em preto
      document.querySelectorAll("pre mark, code mark, .hljs mark").forEach((mark) => {
        const parent = mark.parentNode
        if (parent) {
          // Substituir o elemento mark pelo seu conteúdo
          while (mark.firstChild) {
            parent.insertBefore(mark.firstChild, mark)
          }
          parent.removeChild(mark)
        }
      })

      // Garantir que todos os spans dentro de blocos de código não tenham background
      document.querySelectorAll("pre span, code span, .hljs span").forEach((span) => {
        if (span instanceof HTMLElement) {
          span.style.backgroundColor = "transparent"
        }
      })
    }

    // Aplicar realce inicial
    applyHighlighting()

    // Registrar um MutationObserver para realçar novos blocos de código adicionados dinamicamente
    const observer = new MutationObserver(applyHighlighting)

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      // Limpar ao desmontar
      observer.disconnect()

      // Remover o link de CSS
      try {
        document.head.removeChild(linkElement)
      } catch (e) {
        console.error("Erro ao remover link de CSS:", e)
      }
    }
  }, [])

  return null
}
