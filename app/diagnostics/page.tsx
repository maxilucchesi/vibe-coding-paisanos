"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Database, RefreshCw, Server, HardDrive } from "lucide-react"
import { runAllTests } from "@/lib/supabase-debug"
import { syncPendingBooksAction } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"
import { initializeLocalStorage, getLocalBooks } from "@/lib/local-storage"

export default function DiagnosticsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>({})
  const [localBooks, setLocalBooks] = useState<any[]>([])

  useEffect(() => {
    // Cargar libros locales
    if (typeof window !== "undefined") {
      setLocalBooks(getLocalBooks())
    }
  }, [])

  const runDiagnostics = async () => {
    setIsLoading(true)
    setResults({})

    try {
      // Ejecutar todas las pruebas
      const allResults = await runAllTests()
      setResults(allResults)
      console.log("Resultados completos:", allResults)

      // Actualizar libros locales
      setLocalBooks(getLocalBooks())
    } catch (error) {
      console.error("Error en diagnóstico:", error)
      setResults((prev) => ({ ...prev, error }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    setIsLoading(true)
    try {
      const result = await syncPendingBooksAction()

      if (result.success) {
        toast({
          title: "Sincronización completada",
          description: result.message,
        })
      } else {
        toast({
          title: "Error de sincronización",
          description: result.message,
          variant: "destructive",
        })
      }

      setResults((prev) => ({ ...prev, sync: result }))

      // Actualizar libros locales
      setLocalBooks(getLocalBooks())
    } catch (error) {
      console.error("Error al sincronizar:", error)
      toast({
        title: "Error de sincronización",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReinitialize = async () => {
    setIsLoading(true)
    try {
      const result = await initializeLocalStorage()

      if (result.success) {
        toast({
          title: "Inicialización completada",
          description: `Se cargaron ${result.count} libros desde Supabase`,
        })
      } else {
        toast({
          title: "Error de inicialización",
          description: "No se pudieron cargar los libros desde Supabase",
          variant: "destructive",
        })
      }

      setResults((prev) => ({ ...prev, init: result }))

      // Actualizar libros locales
      setLocalBooks(getLocalBooks())
    } catch (error) {
      console.error("Error al inicializar:", error)
      toast({
        title: "Error de inicialización",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] p-6">
      <div className="mx-auto max-w-md">
        <header className="mb-8 flex items-center">
          <Link href="/dashboard" className="mr-4">
            <ArrowLeft className="h-5 w-5 text-[#888888]" />
          </Link>
          <h1 className="font-serif text-2xl font-normal text-[#222222]">Diagnóstico</h1>
        </header>

        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-serif text-xl text-[#222222]">Herramientas de diagnóstico</h2>

            <div className="space-y-4">
              <Button className="w-full justify-start" variant="outline" onClick={runDiagnostics} disabled={isLoading}>
                {isLoading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Database className="mr-2 h-4 w-4" />
                )}
                Verificar conexión con Supabase
              </Button>

              <Button className="w-full justify-start" variant="outline" onClick={handleSync} disabled={isLoading}>
                {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Server className="mr-2 h-4 w-4" />}
                Sincronizar libros pendientes
              </Button>

              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={handleReinitialize}
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <HardDrive className="mr-2 h-4 w-4" />
                )}
                Reinicializar almacenamiento local
              </Button>
            </div>
          </div>

          {Object.keys(results).length > 0 && (
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-serif text-xl text-[#222222]">Resultados</h2>
              <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-serif text-xl text-[#222222]">Libros en almacenamiento local</h2>
            {localBooks.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-[#888888]">Total: {localBooks.length} libros</p>
                <p className="text-sm text-[#888888]">
                  Pendientes de sincronizar: {localBooks.filter((b) => b.pending_sync).length} libros
                </p>
                <div className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left p-1">ID</th>
                        <th className="text-left p-1">Título</th>
                        <th className="text-left p-1">Autor</th>
                        <th className="text-left p-1">Tipo</th>
                        <th className="text-left p-1">Pendiente</th>
                      </tr>
                    </thead>
                    <tbody>
                      {localBooks.map((book) => (
                        <tr key={book.id || book.local_id} className="border-t border-gray-200">
                          <td className="p-1">{book.id || book.local_id}</td>
                          <td className="p-1">{book.title}</td>
                          <td className="p-1">{book.author}</td>
                          <td className="p-1">{book.type}</td>
                          <td className="p-1">{book.pending_sync ? "Sí" : "No"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-center text-[#888888]">No hay libros en el almacenamiento local</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
