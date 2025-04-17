"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw } from "lucide-react"

export default function ArchiveError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Archive page error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 py-4">
        <div className="max-w-6xl mx-auto px-4">
          <Link href="/" className="flex items-center text-red-500 hover:text-red-400">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Voltar para a Home
          </Link>
        </div>
      </header>

      {/* Error Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Oops! Algo deu errado</h1>
          <p className="text-gray-400 mb-8">
            Não foi possível carregar a página de arquivo. Por favor, tente novamente mais tarde.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={reset} className="bg-red-600 hover:bg-red-700">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>

            <Link href="/">
              <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-900/20">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para a Home
              </Button>
            </Link>
          </div>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-8 p-4 bg-gray-900 rounded-md text-left">
              <p className="text-sm text-gray-400 mb-2">Detalhes do erro (apenas em desenvolvimento):</p>
              <pre className="text-xs text-red-400 overflow-auto max-h-40 p-2 bg-gray-800 rounded">
                {error.message}
                {"\n"}
                {error.stack}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
