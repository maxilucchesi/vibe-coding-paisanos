// Configuración global de la aplicación

// URL base del sitio
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

// Nombre de la aplicación
export const APP_NAME = "Mis Lecturas"

// Configuración de autenticación
export const AUTH_COOKIE_NAME = "auth-status"
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 1 semana

// Configuración de almacenamiento local
export const LOCAL_STORAGE_BOOKS_KEY = "mis-lecturas-books"
export const LOCAL_STORAGE_AUTH_KEY = "mis-lecturas-auth"

// Exportar configuración completa
export const config = {
  site: {
    url: SITE_URL,
    name: APP_NAME,
  },
  auth: {
    cookieName: AUTH_COOKIE_NAME,
    cookieMaxAge: AUTH_COOKIE_MAX_AGE,
    localStorageKey: LOCAL_STORAGE_AUTH_KEY,
  },
  storage: {
    localStorageBooksKey: LOCAL_STORAGE_BOOKS_KEY,
  },
}

export default config
