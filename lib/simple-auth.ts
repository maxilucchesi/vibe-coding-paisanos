// Importar la configuración
import { LOCAL_STORAGE_AUTH_KEY } from "@/lib/config"

// Sistema de autenticación simple con clave única

// Clave de acceso (puedes cambiarla por la que prefieras)
const ACCESS_KEY = "dayko"

// Nombre de la clave en localStorage
const AUTH_KEY = LOCAL_STORAGE_AUTH_KEY

// Verificar si el usuario está autenticado
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    return localStorage.getItem(AUTH_KEY) === "authenticated"
  } catch (error) {
    console.error("Error al verificar autenticación:", error)
    return false
  }
}

// Iniciar sesión con clave
export function login(key: string): boolean {
  if (key === ACCESS_KEY) {
    try {
      localStorage.setItem(AUTH_KEY, "authenticated")
      return true
    } catch (error) {
      console.error("Error al guardar estado de autenticación:", error)
      return false
    }
  }
  return false
}

// Cerrar sesión
export function logout(): void {
  try {
    localStorage.removeItem(AUTH_KEY)
    // Also remove the cookie
    document.cookie = "auth-status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  } catch (error) {
    console.error("Error al cerrar sesión:", error)
  }
}

// Obtener ID de usuario
// Si has creado un usuario específico en la tabla users, usa ese ID aquí
export function getUserId(): string {
  // Usar el ID del usuario que ya existe en la base de datos
  // Este ID debe coincidir con un registro en la tabla users si hay una restricción de clave foránea
  return "aebaf7a8-0d83-403c-b5f4-9d798b74e3ee"
}
