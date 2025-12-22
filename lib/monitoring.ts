// Tipos de eventos para monitoreo
export type LogEvent = {
  type: "auth" | "data" | "error" | "navigation"
  action: string
  details?: any
  timestamp: string
  userId?: string
}

// Cola de eventos para enviar al servidor
const eventQueue: LogEvent[] = []

// Función para registrar eventos
export function logEvent(event: Omit<LogEvent, "timestamp">) {
  const logEntry: LogEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  }

  // Añadir a la cola
  eventQueue.push(logEntry)

  // Registrar en la consola para desarrollo
  if (process.env.NODE_ENV !== "production") {
    console.log(`[${logEntry.type.toUpperCase()}] ${logEntry.action}:`, logEntry.details || "")
  }

  // Si hay muchos eventos, enviarlos al servidor
  if (eventQueue.length >= 10) {
    flushEvents()
  }
}

// Función para enviar eventos al servidor
async function flushEvents() {
  if (eventQueue.length === 0) return

  // En producción, enviaríamos estos eventos a un servicio de monitoreo
  // Por ahora, solo los registramos en la consola
  if (process.env.NODE_ENV === "production") {
    try {
      // Aquí iría el código para enviar los eventos a un servicio como Sentry, LogRocket, etc.
      // Por ejemplo:
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ events: [...eventQueue] })
      // });

      // Limpiar la cola después de enviar
      eventQueue.length = 0
    } catch (error) {
      console.error("Error al enviar eventos de monitoreo:", error)
    }
  } else {
    // En desarrollo, solo limpiamos la cola
    eventQueue.length = 0
  }
}

// Registrar eventos no capturados
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    logEvent({
      type: "error",
      action: "uncaught_error",
      details: {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      },
    })
  })

  window.addEventListener("unhandledrejection", (event) => {
    logEvent({
      type: "error",
      action: "unhandled_promise_rejection",
      details: {
        reason: event.reason?.toString(),
        stack: event.reason?.stack,
      },
    })
  })
}

// Exportar función para uso en componentes
export default {
  logEvent,
  logAuthEvent: (action: string, details?: any, userId?: string) => logEvent({ type: "auth", action, details, userId }),
  logDataEvent: (action: string, details?: any, userId?: string) => logEvent({ type: "data", action, details, userId }),
  logErrorEvent: (action: string, details?: any, userId?: string) =>
    logEvent({ type: "error", action, details, userId }),
  logNavigationEvent: (action: string, details?: any, userId?: string) =>
    logEvent({ type: "navigation", action, details, userId }),
}
