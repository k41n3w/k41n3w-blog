"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Erro ao verificar sessão:", error)
        }

        const hasSession = !!data.session
        console.log("Verificando sessão no layout admin:", hasSession ? "Autenticado" : "Não autenticado")

        setIsAuthenticated(hasSession)

        // Se não estiver autenticado e não estiver na página de login, redirecionar
        if (!hasSession && pathname !== "/admin/login") {
          console.log("Redirecionando para login a partir do layout")
          window.location.href = "/admin/login"
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Erro ao verificar autenticação no layout:", error)
        setIsLoading(false)

        // Em caso de erro, redirecionar para login se não estiver na página de login
        if (pathname !== "/admin/login") {
          window.location.href = "/admin/login"
        }
      }
    }

    checkAuth()

    // Configurar um listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Evento de autenticação no layout:", event)
      const isAuth = !!session
      setIsAuthenticated(isAuth)

      if (!isAuth && pathname !== "/admin/login") {
        window.location.href = "/admin/login"
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [pathname, supabase.auth])

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

  // Se estiver na página de login ou autenticado, mostrar o conteúdo
  if (pathname === "/admin/login" || isAuthenticated) {
    return <>{children}</>
  }

  // Caso contrário, não mostrar nada (o redirecionamento já foi iniciado)
  return null
}
