"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Book, X, RefreshCw } from "lucide-react"
import { searchBooks, type GoogleBookVolume, extractBookInfo } from "@/lib/google-books"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

interface BookMetadataSearchProps {
  bookTitle: string
  bookAuthor: string
  onSelectMetadata: (metadata: ReturnType<typeof extractBookInfo>) => void
}

export function BookMetadataSearch({ bookTitle, bookAuthor, onSelectMetadata }: BookMetadataSearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<GoogleBookVolume[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedBook, setSelectedBook] = useState<GoogleBookVolume | null>(null)

  // Initialize query with book title and author when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open && !query) {
      setQuery(`${bookTitle} ${bookAuthor}`)
    }
    setOpen(open)
  }

  // Perform search when query changes
  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    setHasSearched(true)
    setSelectedBook(null)

    try {
      const books = await searchBooks(query)
      setResults(books)
    } catch (error) {
      console.error("Error en la búsqueda:", error)
    } finally {
      setIsSearching(false)
    }
  }

  // Handle book selection
  const handleSelectBook = (volume: GoogleBookVolume) => {
    setSelectedBook(volume)
  }

  // Apply selected metadata
  const handleApplyMetadata = () => {
    if (selectedBook) {
      const bookInfo = extractBookInfo(selectedBook)
      onSelectMetadata(bookInfo)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs rounded-full">
          <RefreshCw className="h-3 w-3" />
          Actualizar metadatos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buscar metadatos alternativos</DialogTitle>
          <DialogDescription>
            Busca y selecciona información alternativa para este libro desde Google Books.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por título o autor..."
                className="pr-8"
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
              className="bg-[#D0E2FF] text-[#222222] hover:bg-[#FFA69E]"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {/* Search results */}
          {isSearching ? (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto space-y-2 rounded-md border p-1">
              {results.map((book) => (
                <button
                  key={book.id}
                  className={`flex w-full items-start gap-3 rounded-md p-3 text-left hover:bg-gray-100 transition-colors ${
                    selectedBook?.id === book.id ? "bg-[#D0E2FF] bg-opacity-30" : ""
                  }`}
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

        <DialogFooter className="flex justify-between sm:justify-between">
          <DialogClose asChild>
            <Button variant="ghost" className="rounded-full text-[#888888]">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            onClick={handleApplyMetadata}
            disabled={!selectedBook}
            className="rounded-full bg-[#D0E2FF] text-[#222222] hover:bg-[#FFA69E]"
          >
            Aplicar metadatos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
