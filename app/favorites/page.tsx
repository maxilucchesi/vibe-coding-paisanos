"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getFavoriteBooks } from "@/lib/books"
import { UserNav } from "@/components/user-nav"
import { BookCard } from "@/components/book-card"
import { toast } from "@/components/ui/use-toast"

export default function FavoritesPage() {
  const [favoriteBooks, setFavoriteBooks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"list" | "gallery">("list")

  // Load favorite books
  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true)
      try {
        const books = await getFavoriteBooks()
        console.log("Loaded favorite books:", books)
        setFavoriteBooks(books)
      } catch (error) {
        console.error("Error loading favorite books:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los libros favoritos. Intenta refrescar la página.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadFavorites()
  }, [])

  // Esta función ya no es necesaria, pero la mantenemos para no romper la interfaz con UserNav
  const handleViewModeChange = (mode: "list" | "gallery") => {
    // No hacemos nada, siempre mantenemos la vista de lista
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] p-6">
      <div className="mx-auto max-w-md">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="mr-4">
              <ArrowLeft className="h-5 w-5 text-[#888888]" />
            </Link>
            <h1 className="font-serif text-2xl font-normal text-[#222222]">Tus Mejores Lecturas del Año 💫</h1>
          </div>
          <UserNav viewMode={viewMode} onViewModeChange={handleViewModeChange} />
        </header>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl bg-white p-4 shadow-sm animate-pulse">
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : favoriteBooks.length > 0 ? (
          <div className="space-y-4">
            {favoriteBooks.map((book) => (
              <BookCard key={book.id || book.local_id || Date.now()} book={book} type="read" viewMode="list" />
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="text-[#888888]">Aún no tienes libros favoritos</p>
            <p className="mt-2 text-sm text-[#888888]">Califica un libro con 5 estrellas para verlo aquí</p>
            <Link href="/add-book" className="mt-4 inline-block text-sm text-[#FFA69E] hover:underline">
              Añadir un nuevo libro
            </Link>
          </div>
        )}

        {favoriteBooks.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-[#888888]">Estos son los libros que tocaron tu corazón este año</p>
            <div className="mt-4 text-2xl">✨📚💖</div>
          </div>
        )}
      </div>
    </div>
  )
}
