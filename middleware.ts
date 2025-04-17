import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Log da requisição para diagnóstico
  console.log(`Middleware: Requisição para ${request.nextUrl.pathname}`)

  // Criar uma resposta com base na resposta original
  const response = NextResponse.next()

  // Adicionar headers para contornar problemas de CORS
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Authorization")

  // Adicionar cabeçalhos de cache com base no caminho
  const { pathname } = request.nextUrl

  // Páginas estáticas (home, about, etc.) - cache por 1 dia com revalidação a cada hora
  if (pathname === "/" || pathname === "/about" || pathname.startsWith("/archive")) {
    response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400")
  }

  // Páginas de posts individuais - cache por 1 dia com revalidação a cada 30 minutos
  else if (pathname.startsWith("/posts/")) {
    response.headers.set("Cache-Control", "public, max-age=1800, s-maxage=86400, stale-while-revalidate=43200")
  }

  // Páginas administrativas - sem cache
  else if (pathname.startsWith("/admin")) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
  }

  // Recursos estáticos - cache por tempo mais longo (1 semana)
  else if (pathname.match(/\.(css|js|jpg|jpeg|png|gif|ico|svg)$/)) {
    response.headers.set("Cache-Control", "public, max-age=604800, s-maxage=604800, immutable")
  }

  // Outras páginas - cache moderado
  else {
    response.headers.set("Cache-Control", "public, max-age=60, s-maxage=3600, stale-while-revalidate=3600")
  }

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
     * - api routes (que começam com /api/)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/).*)",
  ],
}
