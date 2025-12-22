"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Book, X } from "lucide-react"
import { searchBooks, type GoogleBookVolume, extractBookInfo } from "@/lib/google-books"
import { Skeleton } from "@/components/ui/skeleton"

interface BookSearchProps {
  onSelectBook: (bookInfo: ReturnType<typeof extractBookInfo>) => void
  initialQuery?: string
}

export function BookSearch({ onSelectBook, initialQuery = "" }: BookSearchProps) {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<GoogleBookVolume[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Realizar búsqueda cuando cambia la consulta
  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    setHasSearched(true)

    try {
      const books = await searchBooks(query)
      setResults(books)
    } catch (error) {
      console.error("Error en la búsqueda:", error)
    } finally {
      setIsSearching(false)
    }
  }

  // Manejar la selección de un libro
  const handleSelectBook = (volume: GoogleBookVolume) => {
    const bookInfo = extractBookInfo(volume)
    onSelectBook(bookInfo)
    setResults([]) // Limpiar resultados después de seleccionar
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título o autor..."
            className="pr-8 h-12"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          {query && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setQuery("")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          onClick={handleSearch}
          variant="default"
          size="icon"
          disabled={isSearching || !query.trim()}
          className="h-12 w-12 bg-[#D0E2FF] text-[#222222] hover:bg-[#FFA69E]"
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>

      {/* Resultados de búsqueda */}
      {isSearching ? (
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : results.length > 0 ? (
        <div className="max-h-[calc(100vh-250px)] overflow-y-auto space-y-2 rounded-md border p-1">
          {results.map((book) => (
            <button
              key={book.id}
              className="flex w-full items-start gap-3 rounded-md p-3 text-left hover:bg-gray-100 transition-colors"
              onClick={() => handleSelectBook(book)}
            >
              {book.volumeInfo.imageLinks?.smallThumbnail ? (
                <img
                  src={book.volumeInfo.imageLinks.smallThumbnail || "/placeholder.svg"}
                  alt={book.volumeInfo.title}
                  className="h-20 w-14 object-cover rounded-sm"
                />
              ) : (
                <div className="flex h-20 w-14 items-center justify-center rounded-sm bg-gray-200">
                  <Book className="h-6 w-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-1">{book.volumeInfo.title}</h4>
                <p className="text-xs text-gray-500 line-clamp-1">
                  {book.volumeInfo.authors?.join(", ") || "Autor desconocido"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {book.volumeInfo.publishedDate && `${book.volumeInfo.publishedDate} · `}
                  {book.volumeInfo.publisher}
                </p>
                {book.volumeInfo.categories && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {book.volumeInfo.categories.slice(0, 2).map((category, index) => (
                      <span key={index} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {category}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : hasSearched && query.trim() ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">No se encontraron resultados para "{query}"</p>
          <p className="text-sm">Intenta con otro título o autor</p>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <Book className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Busca por título, autor o ISBN</p>
        </div>
      )}
    </div>
  )
}
