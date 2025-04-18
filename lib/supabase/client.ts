import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./database.types"

// Usar uma variável global para armazenar a instância do cliente
// Isso evita a criação de múltiplas instâncias
let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | undefined = undefined

export function createClient() {
  if (supabaseInstance) {
    return supabaseInstance
  }

  // Verificar se as variáveis de ambiente estão definidas
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error("NEXT_PUBLIC_SUPABASE_URL não está definida")
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida")
  }

  try {
    // Remova a opção 'cookies' para usar automaticamente document.cookie
    supabaseInstance = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        debug: true,
        // Remova a configuração de cookies para usar document.cookie automaticamente
      },
    )

    return supabaseInstance
  } catch (error) {
    console.error("Erro ao criar cliente Supabase no navegador:", error)
    // Retornar um cliente mock para evitar erros de runtime
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
      },
    } as any
  }
}
