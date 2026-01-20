import { createClient } from "./supabase"

// Iniciar sesión con magic link
export async function signInWithMagicLink(email: string) {
  try {
    const supabase = createClient()

    // Limpiar cualquier sesión existente antes de enviar un nuevo magic link
    await supabase.auth.signOut()

    // Enviar el magic link con opciones mejoradas
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: true,
        // Aumentar el tiempo de expiración del magic link
        emailLinkExpirationInSeconds: 60 * 30, // 30 minutos
      },
    })

    if (error) {
      console.error("Error al enviar magic link:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error en signInWithMagicLink:", error)
    throw error
  }
}

// Cerrar sesión
export async function signOut() {
  try {
    const supabase = createClient()

    // Limpiar cookies y almacenamiento local
    if (typeof window !== "undefined") {
      localStorage.removeItem("giuli-reading-app-auth")
    }

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Error al cerrar sesión:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Error en signOut:", error)
    throw error
  }
}

// Verificar si el usuario está autenticado
export async function isAuthenticated() {
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    return !!data.session
  } catch (error) {
    console.error("Error en isAuthenticated:", error)
    return false
  }
}

// Obtener el usuario actual
export async function getCurrentUser() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      console.error("Error al obtener usuario:", error)
      return null
    }

    return data.user
  } catch (error) {
    console.error("Error en getCurrentUser:", error)
    return null
  }
}

// Obtener la sesión actual (seguro para server components)
export async function getCurrentSession() {
  try {
    // Intentar usar el cliente del servidor si estamos en un Server Component
    if (typeof window === "undefined") {
      // Importación dinámica para evitar errores en el cliente
      const { createServerComponentClient } = await import("@supabase/auth-helpers-nextjs")
      const { cookies } = await import("next/headers")

      const supabase = createServerComponentClient({ cookies })
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Error al obtener sesión en el servidor:", error)
        return null
      }

      return data.session
    }

    // Si estamos en el cliente, usar el cliente normal
    const supabase = createClient()
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Error al obtener sesión en el cliente:", error)
      return null
    }

    return data.session
  } catch (error) {
    console.error("Error en getCurrentSession:", error)
    return null
  }
}

// Refrescar la sesión
export async function refreshSession() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.refreshSession()

    if (error) {
      console.error("Error al refrescar sesión:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error en refreshSession:", error)
    throw error
  }
}
