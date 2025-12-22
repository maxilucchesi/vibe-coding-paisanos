// Implementación simple de límite de tasa en memoria
// En producción, esto debería usar Redis u otro almacenamiento distribuido

type RateLimitEntry = {
  count: number
  resetAt: number
}

const rateLimits = new Map<string, RateLimitEntry>()

export interface RateLimitOptions {
  // Número máximo de intentos permitidos
  maxAttempts: number
  // Periodo de tiempo en segundos
  windowSizeInSeconds: number
  // Identificador único (email, IP, etc.)
  identifier: string
}

export interface RateLimitResult {
  success: boolean
  remainingAttempts: number
  resetAt: Date
  blocked: boolean
}

export function checkRateLimit(options: RateLimitOptions): RateLimitResult {
  const { maxAttempts, windowSizeInSeconds, identifier } = options
  const now = Date.now()

  // Obtener o crear entrada para este identificador
  let entry = rateLimits.get(identifier)

  if (!entry || entry.resetAt < now) {
    // Si no hay entrada o ha expirado, crear una nueva
    entry = {
      count: 0,
      resetAt: now + windowSizeInSeconds * 1000,
    }
  }

  // Incrementar contador
  entry.count += 1

  // Guardar entrada actualizada
  rateLimits.set(identifier, entry)

  // Verificar si se ha excedido el límite
  const blocked = entry.count > maxAttempts

  return {
    success: !blocked,
    remainingAttempts: Math.max(0, maxAttempts - entry.count),
    resetAt: new Date(entry.resetAt),
    blocked,
  }
}

// Limpiar entradas expiradas periódicamente
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [identifier, entry] of rateLimits.entries()) {
      if (entry.resetAt < now) {
        rateLimits.delete(identifier)
      }
    }
  }, 60000) // Limpiar cada minuto
}
