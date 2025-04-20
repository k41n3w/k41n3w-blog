"use client"

import { useEffect } from "react"
import hljs from "highlight.js"
// Remove the direct CSS import
// import "highlight.js/styles/vs2015.css"

export default function HighlightScript() {
  // Adicione configurações adicionais para garantir que não haja realces de fundo

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
      cssSelector: "pre code", // Garantir que apenas aplique em elementos code dentro de pre
      noHighlightRe: /^$/, // Não aplicar realce automático
    })

    // Realçar todos os blocos de código na página
    hljs.highlightAll()

    // Função para limpar realces de fundo
    const cleanBackgrounds = () => {
      document.querySelectorAll("pre code span").forEach((span) => {
        span.style.backgroundColor = "transparent"
      })

      document.querySelectorAll("pre code mark").forEach((mark) => {
        // Substituir mark pelo seu conteúdo
        const parent = mark.parentNode
        if (parent) {
          while (mark.firstChild) {
            parent.insertBefore(mark.firstChild, mark)
          }
          parent.removeChild(mark)
        }
      })
    }

    // Limpar realces inicialmente
    cleanBackgrounds()

    // Registrar um MutationObserver para realçar novos blocos de código adicionados dinamicamente
    const observer = new MutationObserver(() => {
      hljs.highlightAll()
      // Limpar realces após cada atualização
      setTimeout(cleanBackgrounds, 100)
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
