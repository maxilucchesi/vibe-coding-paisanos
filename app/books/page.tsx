"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookCard } from "@/components/book-card"
import { ArrowLeft, PlusCircle } from "lucide-react"
import { getBooksByType } from "@/lib/books"
import { BookFilter } from "@/components/book-filter"
import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { UserNav } from "@/components/user-nav"

export default function BooksPage({
  searchParams,
}: {
  searchParams: { filter?: string }
}) {
  // Obtener el filtro de la URL o usar "read" como valor predeterminado
  const filter = searchParams.filter || "read"

  const [books, setBooks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"list" | "gallery">("list")

  // Load books
  useEffect(() => {
    const loadBooks = async () => {
      setIsLoading(true)
      try {
        // Cargar libros según el filtro seleccionado
        const loadedBooks = await getBooksByType(filter as "read" | "wishlist")
        setBooks(loadedBooks)
      } catch (error) {
        console.error("Error al cargar libros:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los libros. Intenta refrescar la página.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadBooks()
  }, [filter]) // Eliminada la carga de preferencia de vista

  // Esta función ya no es necesaria, pero la mantenemos para no romper la interfaz con UserNav
  const handleViewModeChange = (mode: "list" | "gallery") => {
    // No hacemos nada, siempre mantenemos la vista de lista
  }

  // Función para asegurar que los libros se muestren en filas completas
  const getBalancedBooks = (books: any[]) => {
    // Si hay un número impar de libros, añadir un elemento vacío para completar la fila
    if (books.length % 2 !== 0) {
      return [...books, { isEmpty: true }]
    }
    return books
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] p-6">
      <div className="mx-auto w-full max-w-md px-2">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="mr-4">
              <ArrowLeft className="h-5 w-5 text-[#888888]" />
            </Link>
            <h1 className="font-serif text-2xl font-normal text-[#222222]">Tus Libros</h1>
          </div>
          <UserNav viewMode={viewMode} onViewModeChange={handleViewModeChange} />
        </header>

        <BookFilter currentFilter={filter} />

        <div className="space-y-4 mt-6 w-full">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-xl bg-white p-4 shadow-sm animate-pulse">
                  <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : books.length > 0 ? (
            <div className="space-y-4">
              {books.map((book) => (
                <BookCard
                  key={book.id || book.local_id || Date.now()}
                  book={book}
                  type={book.type as "read" | "wishlist"}
                  showActions
                  viewMode="list"
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
              <p className="text-[#888888]">No se encontraron libros en esta categoría</p>
              <Link href="/add-book" className="mt-2 inline-block text-sm text-[#FFA69E] hover:underline">
                Añadir un nuevo libro
              </Link>
            </div>
          )}
        </div>

        <Link href="/add-book">
          <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#FFA69E] p-0 shadow-md hover:bg-[#D0E2FF] transition-all duration-300">
            <PlusCircle className="h-6 w-6 text-white" />
            <span className="sr-only">Añadir nuevo libro</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
