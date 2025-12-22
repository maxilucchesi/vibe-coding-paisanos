"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CloudOff, CloudIcon as CloudSync } from "lucide-react"
import { getLocalBooks } from "@/lib/local-storage"
import { syncPendingBooksAction } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"

export function SyncStatus() {
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  // Verificar el estado de conexión y libros pendientes
  useEffect(() => {
    const checkStatus = () => {
      // Verificar conexión
      setIsOnline(navigator.onLine)

      // Verificar libros pendientes
      const localBooks = getLocalBooks()
      const pending = localBooks.filter((book) => book.pending_sync).length
      setPendingCount(pending)
    }

    // Verificar al cargar
    checkStatus()

    // Configurar listeners para cambios de estado
    window.addEventListener("online", checkStatus)
    window.addEventListener("offline", checkStatus)

    // Verificar periódicamente
    const interval = setInterval(checkStatus, 30000)

    return () => {
      window.removeEventListener("online", checkStatus)
      window.removeEventListener("offline", checkStatus)
      clearInterval(interval)
    }
  }, [])

  // Manejar sincronización manual
  const handleSync = async () => {
    if (!isOnline) {
      toast({
        title: "Sin conexión",
        description: "No hay conexión a internet. Intenta más tarde.",
        variant: "destructive",
      })
      return
    }

    if (pendingCount === 0) {
      toast({
        title: "Todo sincronizado",
        description: "No hay cambios pendientes para sincronizar.",
      })
      return
    }

    setIsSyncing(true)

    try {
      const result = await syncPendingBooksAction()

      if (result.success) {
        toast({
          title: "Sincronización completada",
          description: `Se han sincronizado ${pendingCount} libros.`,
        })
        setPendingCount(0)
      } else {
        toast({
          title: "Error de sincronización",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al sincronizar:", error)
      toast({
        title: "Error de sincronización",
        description: "No se pudieron sincronizar los cambios. Intenta más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  // No mostrar nada si todo está sincronizado y hay conexión
  if (pendingCount === 0 && isOnline) {
    return null
  }

  // Mostrar un banner más compacto para dispositivos móviles
  return (
    <div className={`mb-4 p-2 rounded-lg ${isOnline ? "bg-amber-50" : "bg-red-50"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {isOnline ? (
            <CloudSync className="h-4 w-4 text-amber-500 mr-1" />
          ) : (
            <CloudOff className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className="text-xs">
            {!isOnline ? "Sin conexión" : pendingCount > 0 ? `${pendingCount} pendientes` : "Sincronizado"}
          </span>
        </div>

        {isOnline && pendingCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            className="h-6 text-xs py-0 px-2"
            onClick={handleSync}
            disabled={isSyncing}
          >
            {isSyncing && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
            {isSyncing ? "..." : "Sincronizar"}
          </Button>
        )}
      </div>
    </div>
  )
}
