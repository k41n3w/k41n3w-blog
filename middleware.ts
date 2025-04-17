import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Log da requisição para diagnóstico
  console.log(`Middleware: Requisição para ${request.nextUrl.pathname}`)

  // Adicionar headers para diagnóstico
  const response = NextResponse.next()

  // Adicionar headers para contornar problemas de CORS
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Authorization")

  return response
}

// Configurar o middleware para ser executado em todas as rotas
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
