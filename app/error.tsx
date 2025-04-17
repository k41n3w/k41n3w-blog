"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Oops! Algo deu errado</h1>
        <p className="text-gray-400 mb-8">Desculpe pelo inconveniente. Ocorreu um erro ao carregar esta página.</p>
        <div className="space-y-4">
          <Button onClick={reset} className="bg-red-600 hover:bg-red-700 w-full">
            Tentar novamente
          </Button>
          <Link href="/">
            <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-900/20 w-full">
              Voltar para a página inicial
            </Button>
          </Link>
        </div>
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-gray-900 rounded-md text-left">
            <p className="text-sm text-gray-400 mb-2">Detalhes do erro (apenas em desenvolvimento):</p>
            <pre className="text-xs text-red-400 overflow-auto max-h-40">
              {error.message}
              {"\n"}
              {error.stack}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
