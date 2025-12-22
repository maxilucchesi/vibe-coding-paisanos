import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    // Verificar que la solicitud tenga el formato correcto
    const body = await request.json()

    if (!body.events || !Array.isArray(body.events)) {
      return NextResponse.json({ error: "Formato de solicitud inválido" }, { status: 400 })
    }

    // Obtener cliente de Supabase
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Verificar sesión (opcional, podríamos permitir logs anónimos)
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData.session?.user?.id

    // En una implementación real, aquí guardaríamos los logs en la base de datos
    // Por ahora, solo los registramos en la consola del servidor
    console.log("Logs recibidos:", body.events)

    // Si tuviéramos una tabla de logs, podríamos hacer algo como:
    // const events = body.events.map((event: LogEvent) => ({
    //   ...event,
    //   user_id: userId || null,
    // }))
    // await supabase.from('logs').insert(events)

    return NextResponse.json({ success: true, count: body.events.length })
  } catch (error) {
    console.error("Error al procesar logs:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
