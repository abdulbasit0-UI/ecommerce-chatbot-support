import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isAuthPage = nextUrl.pathname.startsWith("/auth")
  const isOnboardingPage = nextUrl.pathname.startsWith("/onboarding")
  const isDashboardPage = nextUrl.pathname.startsWith("/dashboard")
  console.log(req.auth?.user)

  // Redirect logged in users away from auth pages
  console.log(req.auth?.user?.isOnboarded)
  if (isAuthPage && isLoggedIn) {
    if (!req.auth?.user?.isOnboarded) {
      return NextResponse.redirect(new URL("/onboarding", nextUrl))
    }
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  // Redirect non-logged in users to sign in
  if (!isLoggedIn && (isDashboardPage || isOnboardingPage)) {
    return NextResponse.redirect(new URL("/auth/signin", nextUrl))
  }

  // Redirect onboarded users away from onboarding
  if (isOnboardingPage && isLoggedIn && req.auth?.user?.isOnboarded) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  // Redirect non-onboarded users to onboarding
  if (isDashboardPage && isLoggedIn && !req.auth?.user?.isOnboarded) {
    return NextResponse.redirect(new URL("/onboarding", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
