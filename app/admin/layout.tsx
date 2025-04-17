"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authCheckFailed, setAuthCheckFailed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Criar o cliente Supabase
  let supabase: ReturnType<typeof createClient>

  try {
    supabase = createClient()
  } catch (error) {
    console.error("Erro ao criar cliente Supabase no layout:", error)
  }

  useEffect(() => {
    let authTimeout: NodeJS.Timeout | null = null
    let isRedirecting = false

    async function checkAuth() {
      try {
        if (!supabase) {
          console.error("Cliente Supabase não inicializado no layout")
          setIsLoading(false)
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
        const { data, error } = await Promise.race([supabase.auth.getSession(), timeoutPromise])

        // Limpar o timeout se a verificação de autenticação terminar antes
        if (authTimeout) {
          clearTimeout(authTimeout)
          authTimeout = null
        }

        if (error) {
          console.error("Erro ao verificar sessão:", error)
          setAuthCheckFailed(true)
        }

        const hasSession = !!data.session
        console.log("Verificando sessão no layout admin:", hasSession ? "Autenticado" : "Não autenticado")

        setIsAuthenticated(hasSession)

        // Se não estiver autenticado e não estiver na página de login, redirecionar
        if (!hasSession && pathname !== "/admin/login" && !isRedirecting) {
          console.log("Redirecionando para login a partir do layout")
          isRedirecting = true
          router.push("/admin/login")
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Erro ao verificar autenticação no layout:", error)
        setIsLoading(false)
        setAuthCheckFailed(true)

        // Em caso de erro, redirecionar para login se não estiver na página de login
        if (pathname !== "/admin/login" && !isRedirecting) {
          isRedirecting = true
          router.push("/admin/login")
        }
      }
    }

    checkAuth()

    // Configurar um listener para mudanças de autenticação
    let authListener: { data?: { subscription: { unsubscribe: () => void } } } = {}

    if (supabase) {
      try {
        authListener = supabase.auth.onAuthStateChange((event, session) => {
          console.log("Evento de autenticação no layout:", event)
          const isAuth = !!session
          setIsAuthenticated(isAuth)

          if (!isAuth && pathname !== "/admin/login" && !isRedirecting) {
            isRedirecting = true
            router.push("/admin/login")
          }
        })
      } catch (error) {
        console.error("Erro ao configurar listener de autenticação:", error)
      }
    }

    return () => {
      // Limpar o timeout se existir
      if (authTimeout) {
        clearTimeout(authTimeout)
      }

      // Cancelar o listener de autenticação
      if (authListener?.data?.subscription) {
        try {
          authListener.data.subscription.unsubscribe()
        } catch (error) {
          console.error("Erro ao cancelar listener de autenticação:", error)
        }
      }
    }
  }, [pathname, router])

  // Mostrar um indicador de carregamento enquanto verifica a autenticação
  if (isLoading) {
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
            <a href="/admin/login" className="block">
              <button className="w-full border border-red-600 text-red-600 hover:bg-red-900/20 py-2 px-4 rounded">
                Tentar Login Novamente
              </button>
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Se estiver na página de login ou autenticado, mostrar o conteúdo
  if (pathname === "/admin/login" || isAuthenticated) {
    return <>{children}</>
  }

  // Caso contrário, não mostrar nada (o redirecionamento já foi iniciado)
  return null
}
