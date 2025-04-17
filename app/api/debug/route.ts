import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  // Verificar variáveis de ambiente (sem expor valores sensíveis)
  const envCheck = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    POSTGRES_URL: !!process.env.POSTGRES_URL,
  }

  // Testar conexão com Supabase
  let supabaseStatus = "unknown"
  let error = null

  try {
    const supabase = createClient()
    const { data, error: supabaseError } = await supabase.from("posts").select("count").limit(1)

    if (supabaseError) {
      supabaseStatus = "error"
      error = supabaseError.message
    } else {
      supabaseStatus = "connected"
    }
  } catch (e: any) {
    supabaseStatus = "exception"
    error = e.message
  }

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    envCheck,
    supabase: {
      status: supabaseStatus,
      error,
    },
  })
}
