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
  const [authCheckFailed, setAuthCheckFailed] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Criar o cliente Supabase
  let supabase: ReturnType<typeof createClient>

  try {
    supabase = createClient()
  } catch (error) {
    console.error("Erro ao criar cliente Supabase:", error)
  }

  // Verificar se o usuário já está autenticado ao carregar a página
  useEffect(() => {
    let authTimeout: NodeJS.Timeout | null = null

    async function checkAuth() {
      try {
        if (!supabase) {
          console.error("Cliente Supabase não inicializado")
          setIsCheckingAuth(false)
          setAuthCheckFailed(true)
          return
        }

        // Definir um timeout para evitar espera infinita
        const timeoutPromise = new Promise<{ data: { session: null }; error: Error }>((_, reject) => {
          authTimeout = setTimeout(() => {
            reject(new Error("Timeout ao verificar autenticação"))
          }, 5000) // 5 segundos de timeout
        })

        // Corrida entre a verificação de autenticação e o timeout
        const { data } = await Promise.race([supabase.auth.getSession(), timeoutPromise])

        // Limpar o timeout se a verificação de autenticação terminar antes
        if (authTimeout) {
          clearTimeout(authTimeout)
          authTimeout = null
        }

        console.log("Verificando sessão:", data.session ? "Encontrada" : "Não encontrada")

        if (data.session && !isRedirecting) {
          console.log("Usuário já autenticado, redirecionando para o dashboard")
          setIsRedirecting(true)
          router.push("/admin/dashboard")
        } else {
          setIsCheckingAuth(false)
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        setIsCheckingAuth(false)
        setAuthCheckFailed(true)
      }
    }

    checkAuth()

    return () => {
      // Limpar o timeout se existir
      if (authTimeout) {
        clearTimeout(authTimeout)
      }
    }
  }, [router])

  // Adicionar um listener para mudanças de autenticação
  useEffect(() => {
    if (!supabase) return

    let authListener: { data?: { subscription: { unsubscribe: () => void } } } = {}

    try {
      authListener = supabase.auth.onAuthStateChange((event, session) => {
        console.log("Evento de autenticação:", event)

        if (event === "SIGNED_IN" && session && !isRedirecting) {
          console.log("Usuário autenticado via listener, redirecionando...")
          setIsRedirecting(true)

          // Usar setTimeout para evitar múltiplos redirecionamentos
          setTimeout(() => {
            router.push("/admin/dashboard")
          }, 100)
        }
      })
    } catch (error) {
      console.error("Erro ao configurar listener de autenticação:", error)
    }

    return () => {
      if (authListener?.data?.subscription) {
        try {
          authListener.data.subscription.unsubscribe()
        } catch (error) {
          console.error("Erro ao cancelar listener de autenticação:", error)
        }
      }
    }
  }, [router, isRedirecting])

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

        // Evitar redirecionamentos múltiplos
        if (!isRedirecting) {
          setIsRedirecting(true)

          // Usar setTimeout para evitar múltiplos redirecionamentos
          setTimeout(() => {
            // Redirecionar para o dashboard usando window.location para um redirecionamento mais forte
            window.location.href = "/admin/dashboard"
          }, 100)
        }
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

  // Se houver falha na verificação de autenticação, mostrar mensagem de erro com link para limpar sessão
  if (authCheckFailed) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Erro de Autenticação</h1>
          <p className="text-gray-400 mb-6">
            Ocorreu um erro ao verificar sua autenticação. Isso pode ser causado por um problema com os cookies ou
            sessão.
          </p>
          <div className="space-y-4">
            <a href="/clear-session" className="block">
              <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded">
                Limpar Dados de Sessão
              </button>
            </a>
            <a href="/" className="block">
              <button className="w-full border border-red-600 text-red-600 hover:bg-red-900/20 py-2 px-4 rounded">
                Voltar para Home
              </button>
            </a>
          </div>
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

              <div className="pt-2">
                <Link href="/clear-session" className="text-sm text-red-400 hover:text-red-300">
                  Problemas para entrar? Limpar dados de sessão
                </Link>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={isLoading || isRedirecting}
              >
                {isLoading ? "Entrando..." : isRedirecting ? "Redirecionando..." : "Entrar"}
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
