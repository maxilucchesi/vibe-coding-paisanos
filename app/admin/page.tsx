"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw, Database } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { enrichBooksWithMetadataAction } from "@/app/actions/enrich-books"

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleEnrichBooks = async () => {
    setIsLoading(true)
    try {
      toast({
        title: "Procesando libros",
        description: "Estamos enriqueciendo tus libros con metadatos. Esto puede tomar un momento...",
      })

      const result = await enrichBooksWithMetadataAction()

      setResults(result)

      if (result.success) {
        toast({
          title: "Proceso completado",
          description: result.message,
        })
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al enriquecer libros:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado al procesar los libros",
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
          <h1 className="font-serif text-2xl font-normal text-[#222222]">Administración</h1>
        </header>

        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-serif text-xl text-[#222222]">Herramientas de administración</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-[#222222] mb-2">Enriquecer libros con metadatos</h3>
                <p className="text-sm text-[#888888] mb-4">
                  Esta acción buscará información adicional para tus libros existentes utilizando la API de Google
                  Books. Se actualizarán portadas, descripciones y otra información relevante.
                </p>
                <Button
                  onClick={handleEnrichBooks}
                  disabled={isLoading}
                  className="w-full bg-[#D0E2FF] text-[#222222] hover:bg-[#FFA69E]"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Enriquecer libros
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {results && (
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-serif text-xl text-[#222222]">Resultados</h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-sm text-[#888888]">Total de libros</p>
                  <p className="text-xl font-medium text-[#222222]">{results.total}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <p className="text-sm text-[#888888]">Actualizados</p>
                  <p className="text-xl font-medium text-green-600">{results.updated}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg text-center">
                  <p className="text-sm text-[#888888]">Omitidos</p>
                  <p className="text-xl font-medium text-yellow-600">{results.skipped}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg text-center">
                  <p className="text-sm text-[#888888]">Fallidos</p>
                  <p className="text-xl font-medium text-red-600">{results.failed}</p>
                </div>
              </div>

              {results.details && results.details.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-[#222222] mb-2">Detalles</h3>
                  <div className="bg-gray-50 p-3 rounded-lg text-xs overflow-auto max-h-60">
                    <pre>{JSON.stringify(results.details, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
