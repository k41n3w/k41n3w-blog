"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"

export default function CachePurgePage() {
  const [path, setPath] = useState("/")
  const [selectedOption, setSelectedOption] = useState("home")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string }>({})
  const { toast } = useToast()

  const predefinedPaths = [
    { id: "home", label: "Página inicial", path: "/" },
    { id: "about", label: "Sobre", path: "/about" },
    { id: "archive", label: "Arquivo", path: "/archive" },
    { id: "all", label: "Todas as páginas", path: "/*" },
  ]

  const handleOptionChange = (value: string) => {
    setSelectedOption(value)
    const selected = predefinedPaths.find((item) => item.id === value)
    if (selected) {
      setPath(selected.path)
    }
  }

  const handlePurgeCache = async () => {
    if (!path) {
      toast({
        title: "Erro",
        description: "Por favor, especifique um caminho para limpar o cache.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setResult({})

    try {
      // Obter o token de purge do cache do localStorage (deve ser configurado pelo admin)
      const token = localStorage.getItem("CACHE_PURGE_TOKEN")

      if (!token) {
        throw new Error("Token de purge não encontrado. Por favor, configure o token nas configurações abaixo.")
      }

      const response = await fetch("/api/purge-cache", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ path }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Falha ao purgar o cache")
      }

      setResult({
        success: true,
        message: data.message || `Cache limpo com sucesso para: ${path}`,
      })

      toast({
        title: "Sucesso",
        description: `Cache limpo com sucesso para: ${path}`,
      })
    } catch (error: any) {
      console.error("Erro ao purgar cache:", error)
      setResult({
        success: false,
        error: error.message || "Ocorreu um erro ao tentar limpar o cache",
      })

      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao tentar limpar o cache",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 py-4">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <Link href="/admin/dashboard" className="flex items-center text-red-500 hover:text-red-400">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Voltar para o Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-red-500 mb-6">Gerenciamento de Cache</h1>

        <Card className="bg-gray-900 border-gray-800 text-white mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-red-500">Limpar Cache CDN</CardTitle>
            <CardDescription className="text-gray-400">
              Use esta ferramenta para limpar o cache da CDN para páginas específicas ou para todo o site.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Selecione uma opção:</h3>
                <RadioGroup value={selectedOption} onValueChange={handleOptionChange} className="space-y-2">
                  {predefinedPaths.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="cursor-pointer">
                        {option.label} <span className="text-gray-500">({option.path})</span>
                      </Label>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom" className="cursor-pointer">
                      Caminho personalizado
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {selectedOption === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="custom-path">Caminho personalizado:</Label>
                  <Input
                    id="custom-path"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder="/caminho/para/limpar"
                    className="bg-gray-800 border-gray-700"
                  />
                  <p className="text-xs text-gray-400">
                    Exemplo: /posts/123 para limpar uma página específica, ou /posts/* para limpar todas as páginas de
                    posts
                  </p>
                </div>
              )}
            </div>

            {result.success && (
              <div className="bg-green-900/30 border border-green-700 rounded-md p-3">
                <p className="text-green-400">{result.message}</p>
              </div>
            )}

            {result.error && (
              <div className="bg-red-900/30 border border-red-700 rounded-md p-3">
                <p className="text-red-400">Erro: {result.error}</p>
              </div>
            )}
          </CardContent>

          <CardFooter>
            <Button
              onClick={handlePurgeCache}
              className="bg-red-600 hover:bg-red-700 flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Limpando...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Limpar Cache
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-gray-900 border-gray-800 text-white">
          <CardHeader>
            <CardTitle className="text-xl text-red-500">Configurações de Cache</CardTitle>
            <CardDescription className="text-gray-400">
              Configure o token de autenticação para a API de purge de cache.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purge-token">Token de Purge:</Label>
              <Input
                id="purge-token"
                type="password"
                placeholder="Token de autenticação para purge de cache"
                defaultValue={localStorage.getItem("CACHE_PURGE_TOKEN") || ""}
                onChange={(e) => localStorage.setItem("CACHE_PURGE_TOKEN", e.target.value)}
                className="bg-gray-800 border-gray-700"
              />
              <p className="text-xs text-gray-400">
                Este token deve corresponder ao valor da variável de ambiente CACHE_PURGE_TOKEN no servidor.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="py-4 bg-gray-900 border-t border-gray-800 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} k41n3w. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
