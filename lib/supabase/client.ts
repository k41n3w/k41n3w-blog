import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./database.types"

// Usar uma variável global para armazenar a instância do cliente
// Isso evita a criação de múltiplas instâncias
const globalForSupabase = globalThis as unknown as {
  supabase: ReturnType<typeof createBrowserClient<Database>> | undefined
}

export function createClient() {
  if (globalForSupabase.supabase) {
    return globalForSupabase.supabase
  }

  globalForSupabase.supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      debug: true,
    },
  )

  return globalForSupabase.supabase
}
