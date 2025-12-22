"use client"

import { useState, useEffect } from "react"
import { CloudOff } from "lucide-react"

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    // Verificar estado inicial
    updateOnlineStatus()

    // Añadir event listeners
    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    // Limpiar event listeners
    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [])

  if (isOnline) {
    return null
  }

  return (
    <div className="mb-4 p-3 rounded-lg bg-red-50 flex items-center">
      <CloudOff className="h-4 w-4 text-red-500 mr-2" />
      <span className="text-sm text-red-700">
        Sin conexión. Los cambios se guardarán localmente y se sincronizarán cuando vuelvas a estar en línea.
      </span>
    </div>
  )
}
