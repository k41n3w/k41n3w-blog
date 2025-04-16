import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session and trying to access admin routes
  if (!session && req.nextUrl.pathname.startsWith("/admin")) {
    // Allow access to login page
    if (req.nextUrl.pathname === "/admin/login") {
      return res
    }

    // Redirect to login for all other admin routes
    const redirectUrl = new URL("/admin/login", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/admin/:path*"],
}
