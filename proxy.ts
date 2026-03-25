import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const response = NextResponse.next()

  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Authorization")

  const { pathname } = request.nextUrl

  if (request.method === "GET") {
    if (pathname === "/api/image-proxy") {
      const url = request.nextUrl.searchParams.get("url") || ""
      response.headers.set("X-Image-URL", url)
      response.headers.set("Cache-Control", "public, max-age=31536000, s-maxage=31536000, immutable")
      response.headers.set("CDN-Cache-Control", "public, max-age=31536000, s-maxage=31536000, immutable")
      response.headers.set("Vercel-CDN-Cache-Control", "public, max-age=31536000, s-maxage=31536000, immutable")
    } else if (pathname === "/" || pathname === "/about") {
      response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate")
    } else if (pathname.startsWith("/archive")) {
      response.headers.set("Cache-Control", "public, max-age=1800, s-maxage=43200, stale-while-revalidate")
    } else if (pathname.startsWith("/posts/")) {
      response.headers.set("Cache-Control", "public, max-age=1800, s-maxage=43200, stale-while-revalidate")
    } else if (pathname.match(/\.(css|js|jpg|jpeg|png|gif|ico|svg)$/)) {
      response.headers.set("Cache-Control", "public, max-age=31536000, immutable")
    } else if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/")) {
      response.headers.set("Cache-Control", "public, max-age=60, s-maxage=3600, stale-while-revalidate")
    } else {
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
      response.headers.set("Pragma", "no-cache")
      response.headers.set("Expires", "0")
    }
  } else {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
