import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if the user is authenticated for protected routes
  if (
    !session &&
    (req.nextUrl.pathname.startsWith("/dashboard") ||
      req.nextUrl.pathname.startsWith("/upload") ||
      req.nextUrl.pathname.startsWith("/messages"))
  ) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/login"
    redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is logged in and tries to access auth pages, redirect to dashboard
  if (
    session &&
    (req.nextUrl.pathname.startsWith("/login") ||
      req.nextUrl.pathname.startsWith("/signup") ||
      req.nextUrl.pathname.startsWith("/forgot-password"))
  ) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/dashboard"
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/upload/:path*",
    "/messages/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ],
}
