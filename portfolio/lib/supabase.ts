import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./database.types"

// Tipos para nuestra base de datos
export type Book = {
  id: string
  title: string
  author: string
  type: "read" | "wishlist"
  rating?: number | null
  date_finished?: string | null
  review?: string | null
  created_at: string
  user_id: string
}

// Cliente cacheado (singleton)
let cachedClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

/**
 * Obtiene el cliente de Supabase (singleton).
 * Retorna null si faltan las variables de entorno (sin throw).
 */
export function getSupabaseClient() {
  // Verificar si faltan las variables de entorno
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null
  }

  // Si ya existe el cliente cacheado, retornarlo
  if (cachedClient) {
    return cachedClient
  }

  // Crear y cachear el cliente
  cachedClient = createClientComponentClient<Database>({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    options: {
      auth: {
        persistSession: true,
        storageKey: "giuli-reading-app-auth",
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    },
  })

  return cachedClient
}

// Cliente para componentes del lado del cliente (mantiene compatibilidad)
export const createClient = () => {
  return getSupabaseClient()
}

// Export para compatibilidad (retorna null si faltan env vars)
export const supabase = getSupabaseClient() ?? null
