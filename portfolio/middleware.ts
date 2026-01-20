import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Rutas públicas que no requieren autenticación
  const publicRoutes = ["/"]
  const url = req.nextUrl.clone()

  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some((route) => req.nextUrl.pathname === route)

  // Modo de exploración (para desarrollo)
  const isExploreMode = req.nextUrl.pathname === "/dashboard" && req.nextUrl.searchParams.get("mode") === "explore"

  // Verificar si el usuario está autenticado mediante la cookie
  const isAuthenticated = req.cookies.has("auth-status")

  // Si no hay sesión y no es una ruta pública ni modo exploración
  if (!isAuthenticated && !isPublicRoute && !isExploreMode) {
    console.log("Middleware: Redirecting to login - not authenticated")
    // Redirigir al login
    return NextResponse.redirect(new URL("/", req.url))
  }

  // Si hay una sesión y el usuario intenta acceder a la página de login
  if (isAuthenticated && req.nextUrl.pathname === "/") {
    console.log("Middleware: Redirecting to dashboard - already authenticated")
    // Redirigir al dashboard
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
