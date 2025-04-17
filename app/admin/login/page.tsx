"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [loginError, setLoginError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Criar o cliente Supabase
  let supabase: ReturnType<typeof createClient>

  try {
    supabase = createClient()
  } catch (error) {
    console.error("Erro ao criar cliente Supabase:", error)
  }

  // Verificar se o usuário já está autenticado ao carregar a página
  useEffect(() => {
    async function checkAuth() {
      try {
        if (!supabase) {
          console.error("Cliente Supabase não inicializado")
          setIsCheckingAuth(false)
          return
        }

        const { data } = await supabase.auth.getSession()

        console.log("Verificando sessão:", data.session ? "Encontrada" : "Não encontrada")

        if (data.session) {
          console.log("Usuário já autenticado, redirecionando para o dashboard")
          router.push("/admin/dashboard")
        } else {
          setIsCheckingAuth(false)
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  // Adicionar um listener para mudanças de autenticação
  useEffect(() => {
    if (!supabase) return

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Evento de autenticação:", event)

      if (event === "SIGNED_IN" && session) {
        console.log("Usuário autenticado via listener, redirecionando...")
        router.push("/admin/dashboard")
      }
    })

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError(null)

    try {
      if (!supabase) {
        throw new Error("Cliente Supabase não inicializado")
      }

      // Usar diretamente o cliente Supabase para autenticação
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Erro de login:", error.message)
        setLoginError(error.message)
        toast({
          title: "Erro de login",
          description: error.message,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (data.user) {
        console.log("Login bem-sucedido para:", data.user.email)
        console.log("Sessão criada:", !!data.session)

        toast({
          title: "Login bem-sucedido",
          description: "Redirecionando para o dashboard...",
        })

        // Redirecionar para o dashboard
        router.push("/admin/dashboard")
      } else {
        setLoginError("Não foi possível autenticar. Tente novamente.")
        toast({
          title: "Erro de login",
          description: "Não foi possível autenticar. Tente novamente.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    } catch (error: any) {
      console.error("Exceção de login:", error)
      setLoginError(error.message || "Ocorreu um erro ao tentar fazer login")
      toast({
        title: "Erro de login",
        description: "Ocorreu um erro ao tentar fazer login. Tente novamente.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  // Mostrar um indicador de carregamento enquanto verifica a autenticação
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 py-4">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/" className="flex items-center text-red-500 hover:text-red-400">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Voltar para o site
          </Link>
        </div>
      </header>

      {/* Login Form */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800 text-white">
          <CardHeader>
            <CardTitle className="text-2xl text-red-500">Admin Login</CardTitle>
            <CardDescription className="text-gray-400">
              Entre com suas credenciais para acessar o painel administrativo
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {loginError && (
                <div className="bg-red-900/50 border border-red-700 text-white px-4 py-3 rounded">
                  <p>{loginError}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link href="/admin/forgot-password" className="text-sm text-red-400 hover:text-red-300">
                    Esqueceu a senha?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>

      {/* Footer */}
      <footer className="py-4 bg-gray-900 border-t border-gray-800 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} k41n3w. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
