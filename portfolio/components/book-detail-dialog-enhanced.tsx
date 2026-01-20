"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Edit2, Heart, CloudOff, Calendar, BookOpen } from "lucide-react"

interface BookDetailDialogProps {
  book: {
    id?: string
    local_id?: string
    title: string
    author: string
    rating: number | null
    date_finished?: string
    review?: string
    pending_sync?: boolean
    // Nuevos campos de metadata
    published_date?: string | null
    description?: string | null
    categories?: string[] | null
    thumbnail?: string | null
    page_count?: number | null
    publisher?: string | null
    isbn?: string | null
  }
  type: "read" | "wishlist"
  children: React.ReactNode
}

export function BookDetailDialogEnhanced({ book, type, children }: BookDetailDialogProps) {
  const [open, setOpen] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)

  // Formatear la fecha para mostrarla de manera más amigable
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Sin fecha"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-xl max-h-[90vh] overflow-y-auto shadow-[0_1px_2px_rgba(0,0,0,0.07),0_4px_8px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.03)]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-serif text-2xl text-[#222222]">{book.title}</DialogTitle>
            {book.pending_sync && (
              <div className="flex items-center text-amber-500 text-xs">
                <CloudOff className="h-3 w-3 mr-1" />
                <span>Pendiente de sincronizar</span>
              </div>
            )}
          </div>
          <DialogDescription className="text-[#888888]">{book.author}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Portada del libro si está disponible */}
          {book.thumbnail ? (
            <div className="flex justify-center mb-4">
              <div className="h-52 w-32 rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden bg-gray-100">
                <img
                  src={book.thumbnail || "/placeholder.svg"}
                  alt={book.title}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/abstract-book-cover.png"
                    e.currentTarget.className = "h-full w-full object-contain bg-gray-100"
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-4">
              <div className="h-52 w-32 rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] bg-gray-100 flex items-center justify-center">
                <span className="text-4xl">📚</span>
              </div>
            </div>
          )}

          {type === "read" && (
            <>
              {book.rating && (
                <div className="flex items-center">
                  <span className="text-sm text-[#888888] w-24">Valoración:</span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-sm">
                        {i < (book.rating || 0) ? "⭐" : "☆"}
                      </span>
                    ))}
                  </div>
                  {book.rating === 5 && <Heart className="h-4 w-4 ml-2 fill-[#FFA69E] text-[#FFA69E]" />}
                </div>
              )}

              {book.date_finished && (
                <div className="flex items-start">
                  <span className="text-sm text-[#888888] w-24">Terminado el:</span>
                  <span className="text-sm text-[#222222]">{formatDate(book.date_finished)}</span>
                </div>
              )}

              {book.review && (
                <div className="flex flex-col">
                  <span className="text-sm text-[#888888] mb-2">Tus pensamientos:</span>
                  <div className="bg-[#F5F5F5] p-3 rounded-lg text-sm text-[#222222] shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]">
                    {book.review}
                  </div>
                </div>
              )}
            </>
          )}

          {type === "wishlist" && (
            <div className="flex items-center">
              <span className="text-sm text-[#888888]">✨ En tu wishlist</span>
            </div>
          )}

          {/* Información de publicación */}
          {(book.published_date || book.publisher || book.page_count) && (
            <div className="mt-4 border-t pt-4">
              <h4 className="text-sm font-medium text-[#222222] mb-2">Información de publicación</h4>
              <div className="space-y-2">
                {book.published_date && (
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>Publicado: {book.published_date}</span>
                  </div>
                )}
                {book.publisher && (
                  <div className="flex items-center text-sm">
                    <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                    <span>Editorial: {book.publisher}</span>
                  </div>
                )}
                {book.page_count && book.page_count > 0 && (
                  <div className="flex items-center text-sm">
                    <span className="mr-2 text-gray-400 text-xs">📄</span>
                    <span>{book.page_count} páginas</span>
                  </div>
                )}
                {book.isbn && (
                  <div className="flex items-center text-sm">
                    <span className="mr-2 text-gray-400 text-xs">📚</span>
                    <span>ISBN: {book.isbn}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Categorías */}
          {book.categories && book.categories.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <h4 className="text-sm font-medium text-[#222222] mb-2">Categorías</h4>
              <div className="flex flex-wrap gap-1">
                {book.categories.map((category, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Descripción */}
          {book.description && (
            <div className="mt-4 border-t pt-4">
              <h4 className="text-sm font-medium text-[#222222] mb-2">Sinopsis</h4>
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]">
                {showFullDescription ? (
                  <>
                    <p className="whitespace-pre-line">{book.description}</p>
                    <button
                      onClick={() => setShowFullDescription(false)}
                      className="mt-2 text-xs text-[#FFA69E] hover:underline flex items-center"
                    >
                      <span>Mostrar menos</span>
                    </button>
                  </>
                ) : (
                  <>
                    <p className="line-clamp-4 whitespace-pre-line">{book.description}</p>
                    {book.description.length > 200 && (
                      <button
                        onClick={() => setShowFullDescription(true)}
                        className="mt-2 text-xs text-[#FFA69E] hover:underline flex items-center"
                      >
                        <span>Leer más</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            className="rounded-full text-[#888888] hover:bg-[#F5F5F5]"
            onClick={() => setOpen(false)}
          >
            Cerrar
          </Button>
          <Link href={`/edit-book/${book.id || book.local_id}`}>
            <Button className="rounded-full bg-[#D0E2FF] text-[#222222] hover:bg-[#FFA69E] shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
              <Edit2 className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
