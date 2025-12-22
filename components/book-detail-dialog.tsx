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
import { Edit2, Heart, CloudOff } from "lucide-react"

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
  }
  type: "read" | "wishlist"
  children: React.ReactNode
}

export function BookDetailDialog({ book, type, children }: BookDetailDialogProps) {
  const [open, setOpen] = useState(false)

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
      <DialogContent className="sm:max-w-md rounded-xl">
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
                  <div className="bg-[#F5F5F5] p-3 rounded-lg text-sm text-[#222222]">{book.review}</div>
                </div>
              )}
            </>
          )}

          {type === "wishlist" && (
            <div className="flex items-center">
              <span className="text-sm text-[#888888]">✨ En tu wishlist</span>
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
            <Button className="rounded-full bg-[#D0E2FF] text-[#222222] hover:bg-[#FFA69E]">
              <Edit2 className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
