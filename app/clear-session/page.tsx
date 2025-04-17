"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Home, RefreshCw } from "lucide-react"

export default function ClearSessionPage() {
  const [isClearing, setIsClearing] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    message?: string
    clearedCookies?: string[]
    error?: string
  }>({})

  const clearLocalStorage = () => {
    try {
      localStorage.clear()
      return true
    } catch (e) {
      console.error("Erro ao limpar localStorage:", e)
      return false
    }
  }

  const clearSessionStorage = () => {
    try {
      sessionStorage.clear()
      return true
    } catch (e) {
      console.error("Erro ao limpar sessionStorage:", e)
      return false
    }
  }

  const clearCookies = async () => {
    setIsClearing(true)

    try {
      // Limpar localStorage e sessionStorage
      const localStorageCleared = clearLocalStorage()
      const sessionStorageCleared = clearSessionStorage()

      // Chamar a API para limpar cookies do servidor
      const response = await fetch("/api/clear-session")
      const data = await response.json()

      setResult({
        success: data.success,
        message: data.message,
        clearedCookies: data.clearedCookies,
        error: undefined,
      })

      // Limpar cookies do cliente também
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || "Erro ao limpar sessão",
      })
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-2xl text-red-500">Limpar Sessão</CardTitle>
          <CardDescription className="text-gray-400">
            Use esta página para limpar cookies e dados de sessão quando estiver enfrentando problemas de login ou loop
            de redirecionamento.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-gray-300">Esta ação irá:</p>
          <ul className="list-disc pl-5 text-gray-300 space-y-1">
            <li>Limpar todos os cookies do navegador</li>
            <li>Limpar localStorage</li>
            <li>Limpar sessionStorage</li>
            <li>Encerrar qualquer sessão ativa</li>
          </ul>

          {result.success && (
            <div className="bg-green-900/30 border border-green-700 rounded-md p-3 mt-4">
              <p className="text-green-400 font-medium">{result.message}</p>
              {result.clearedCookies && result.clearedCookies.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-green-400">Cookies limpos:</p>
                  <ul className="text-xs text-green-300 mt-1 pl-5 list-disc">
                    {result.clearedCookies.map((cookie) => (
                      <li key={cookie}>{cookie}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {result.error && (
            <div className="bg-red-900/30 border border-red-700 rounded-md p-3 mt-4">
              <p className="text-red-400">Erro: {result.error}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 flex items-center"
            onClick={clearCookies}
            disabled={isClearing}
          >
            {isClearing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Limpando...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Limpar Sessão
              </>
            )}
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full border-red-600 text-red-600 hover:bg-red-900/20">
              <Home className="mr-2 h-4 w-4" />
              Voltar para Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
