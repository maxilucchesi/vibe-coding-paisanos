import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")

    // Registrar información para depuración
    console.log("Auth callback iniciado", {
      url: request.url,
      hasCode: !!code,
    })

    if (!code) {
      console.error("No se encontró código en la URL")
      return NextResponse.redirect(new URL("/?error=no-code", requestUrl.origin))
    }

    // Crear cliente de Supabase con cookies
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({
      cookies: () => cookieStore,
    })

    // Intercambiar el código por una sesión
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error("Error al intercambiar código por sesión:", exchangeError)
      return NextResponse.redirect(new URL("/?error=exchange", requestUrl.origin))
    }

    // Verificar que la sesión se haya establecido correctamente
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Error al obtener sesión después del intercambio:", sessionError)
      return NextResponse.redirect(new URL("/?error=session", requestUrl.origin))
    }

    if (!sessionData.session) {
      console.error("No se pudo establecer la sesión después del intercambio")
      return NextResponse.redirect(new URL("/?error=no-session", requestUrl.origin))
    }

    // Establecer cookies adicionales para mejorar la persistencia de la sesión
    const response = NextResponse.redirect(new URL(`/dashboard?auth=${Date.now()}`, requestUrl.origin))

    // Establecer una cookie para indicar que el usuario está autenticado
    response.cookies.set("auth-status", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: "/",
      sameSite: "lax",
    })

    console.log("Auth callback completado con éxito, redirigiendo a dashboard")
    return response
  } catch (error) {
    console.error("Error general en el callback de autenticación:", error)
    const requestUrl = new URL(request.url)
    return NextResponse.redirect(new URL("/?error=general", requestUrl.origin))
  }
}
