import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "./database.types"

export function createClient() {
  const cookieStore = cookies()

  // Verificar se as variáveis de ambiente estão definidas
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error("NEXT_PUBLIC_SUPABASE_URL não está definida")
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida")
  }

  try {
    return createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Certifique-se de que esta é a chave anônima
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name, options) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
        // Adicionar opções para debug
        debug: true,
      },
    )
  } catch (error) {
    console.error("Erro ao criar cliente Supabase:", error)
    // Retornar um cliente mock para evitar erros de runtime
    // Isso permitirá que a página seja renderizada, mesmo que sem dados
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: () => ({ data: [], error: null }),
              data: [],
              error: null,
            }),
            single: () => ({ data: null, error: null }),
            data: [],
            error: null,
          }),
          single: () => ({ data: null, error: null }),
          data: [],
          error: null,
        }),
      }),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } }, error: null }),
      },
      rpc: () => ({ data: null, error: null }),
    } as any
  }
}
