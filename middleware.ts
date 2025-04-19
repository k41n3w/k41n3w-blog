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

  // Verificar se é uma requisição GET (apenas cache para GET)
  if (request.method === "GET") {
    // Páginas estáticas (home, about, etc.)
    if (pathname === "/" || pathname === "/about") {
      response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate")
    }
    // Páginas de arquivo
    else if (pathname.startsWith("/archive")) {
      response.headers.set("Cache-Control", "public, max-age=1800, s-maxage=43200, stale-while-revalidate")
    }
    // Páginas de posts individuais
    else if (pathname.startsWith("/posts/")) {
      response.headers.set("Cache-Control", "public, max-age=1800, s-maxage=43200, stale-while-revalidate")
    }
    // Recursos estáticos
    else if (pathname.match(/\.(css|js|jpg|jpeg|png|gif|ico|svg)$/)) {
      response.headers.set("Cache-Control", "public, max-age=31536000, immutable")
    }
    // Resources from our image proxy - cache for a long time
    else if (pathname.startsWith("/api/image-proxy")) {
      // Let the API route handle the caching headers
      // We don't set them here to avoid conflicts
    }
    // Outras páginas públicas
    else if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/")) {
      response.headers.set("Cache-Control", "public, max-age=60, s-maxage=3600, stale-while-revalidate")
    }
    // Páginas administrativas e APIs - sem cache
    else {
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
      response.headers.set("Pragma", "no-cache")
      response.headers.set("Expires", "0")
    }
  } else {
    // Para métodos não-GET, não cachear
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
  }

  return response
}

// Configurar o middleware para ser executado em todas as rotas exceto assets estáticos
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
