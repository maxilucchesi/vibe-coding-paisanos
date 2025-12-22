"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { StarRating } from "@/components/star-rating"
import { ArrowLeft, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { updateBookAction, deleteBookAction } from "@/app/actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Book } from "@/lib/supabase"
import { BookMetadataSearch } from "@/components/book-metadata-search"
import type { extractBookInfo } from "@/lib/google-books"

interface EditBookFormProps {
  book: Book
}

export function EditBookForm({ book }: EditBookFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [bookType, setBookType] = useState(book.type)
  const [rating, setRating] = useState(book.rating || 0)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [formData, setFormData] = useState({
    title: book.title,
    author: book.author,
    date_finished: book.date_finished || "",
    review: book.review || "",
    // Metadata fields
    published_date: book.published_date || "",
    description: book.description || "",
    categories: book.categories || [],
    thumbnail: book.thumbnail || "",
    page_count: book.page_count || 0,
    publisher: book.publisher || "",
    isbn: book.isbn || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  // Handle metadata selection from search
  const handleSelectMetadata = (metadata: ReturnType<typeof extractBookInfo>) => {
    setFormData((prev) => ({
      ...prev,
      published_date: metadata.publishedDate || prev.published_date,
      description: metadata.description || prev.description,
      categories: metadata.categories || prev.categories,
      thumbnail: metadata.thumbnail || prev.thumbnail,
      page_count: metadata.pageCount || prev.page_count,
      publisher: metadata.publisher || prev.publisher,
      isbn: metadata.isbn || prev.isbn,
    }))

    toast({
      title: "Metadatos actualizados",
      description: "La información del libro ha sido actualizada con éxito.",
    })
  }

  // Function to truncate text
  const truncateText = (text: string, maxLength = 200) => {
    if (!text || text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Prepare data based on book type
      const bookData = {
        title: formData.title,
        author: formData.author,
        type: bookType as "read" | "wishlist",
        ...(bookType === "read" && {
          rating: rating > 0 ? rating : null,
          date_finished: formData.date_finished || null,
          review: formData.review || null,
        }),
        ...(bookType === "wishlist" && {
          rating: null,
          date_finished: null,
          review: null,
        }),
        // Include metadata fields
        published_date: formData.published_date || null,
        description: formData.description || null,
        categories: formData.categories.length > 0 ? formData.categories : null,
        thumbnail: formData.thumbnail || null,
        page_count: formData.page_count > 0 ? formData.page_count : null,
        publisher: formData.publisher || null,
        isbn: formData.isbn || null,
      }

      // Show success toast before redirection
      toast({
        title: "¡Éxito!",
        description: "Tu libro ha sido actualizado.",
      })

      // Use Server Action to update the book
      const result = await updateBookAction(book.id, bookData)

      if (result.success) {
        // Execute client code to update localStorage
        if (result.clientSideCode) {
          try {
            // Use eval to execute client code
            // eslint-disable-next-line no-eval
            eval(result.clientSideCode)
          } catch (error) {
            console.error("Error executing client code:", error)
          }
        }

        router.push("/dashboard")
        router.refresh()
      } else {
        throw new Error("Could not update the book")
      }
    } catch (error) {
      console.error("Error updating book:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar tu libro. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setDeleteError(null)

    try {
      // Use Server Action to delete the book
      const result = await deleteBookAction(book.id)

      if (result.success) {
        // Execute client code to delete from localStorage
        if (result.clientSideCode) {
          try {
            // Use eval to execute client code
            // eslint-disable-next-line no-eval
            eval(result.clientSideCode)
          } catch (error) {
            console.error("Error executing client code:", error)
          }
        }

        // Show success toast before redirection
        toast({
          title: "Libro eliminado",
          description: "El libro ha sido eliminado de tu colección.",
        })

        // Redirect to dashboard with parameter to force update
        router.push(`/dashboard?refresh=${Date.now()}`)
        router.refresh()
      } else {
        throw new Error("Could not delete the book")
      }
    } catch (error) {
      console.error("Error deleting book:", error)

      // Show error message
      const errorMessage =
        error instanceof Error ? error.message : "Hubo un problema al eliminar tu libro. Por favor, inténtalo de nuevo."
      setDeleteError(errorMessage)

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <header className="mb-8 flex items-center">
        <Link href="/dashboard" className="mr-4">
          <ArrowLeft className="h-5 w-5 text-[#888888]" />
        </Link>
        <h1 className="font-serif text-2xl font-normal text-[#222222]">Editar Libro</h1>
      </header>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <RadioGroup
            defaultValue={book.type}
            className="mb-6 flex rounded-full bg-[#F5F5F5] p-1"
            onValueChange={setBookType}
          >
            <div className="w-1/2">
              <RadioGroupItem value="read" id="read" className="peer sr-only" />
              <Label
                htmlFor="read"
                className="flex cursor-pointer justify-center rounded-full py-2 text-center text-sm peer-data-[state=checked]:bg-[#D0E2FF] peer-data-[state=checked]:text-[#222222] text-[#888888] transition-all duration-200"
              >
                Leído
              </Label>
            </div>
            <div className="w-1/2">
              <RadioGroupItem value="wishlist" id="wishlist" className="peer sr-only" />
              <Label
                htmlFor="wishlist"
                className="flex cursor-pointer justify-center rounded-full py-2 text-center text-sm peer-data-[state=checked]:bg-[#D0E2FF] peer-data-[state=checked]:text-[#222222] text-[#888888] transition-all duration-200"
              >
                Wishlist
              </Label>
            </div>
          </RadioGroup>

          <div className="space-y-6">
            {/* Book cover preview */}
            {formData.thumbnail && (
              <div className="flex justify-center mb-4 relative">
                <img
                  src={formData.thumbnail || "/placeholder.svg"}
                  alt={formData.title}
                  className="h-52 rounded-md shadow-md object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/abstract-book-cover.png"
                    e.currentTarget.className = "h-52 w-32 rounded-md shadow-md object-cover bg-gray-100"
                  }}
                />
                <div className="absolute -bottom-3 right-0 left-0 flex justify-center">
                  <BookMetadataSearch
                    bookTitle={formData.title}
                    bookAuthor={formData.author}
                    onSelectMetadata={handleSelectMetadata}
                  />
                </div>
              </div>
            )}

            {/* If no thumbnail, show metadata search button at the top */}
            {!formData.thumbnail && (
              <div className="flex justify-end mb-4">
                <BookMetadataSearch
                  bookTitle={formData.title}
                  bookAuthor={formData.author}
                  onSelectMetadata={handleSelectMetadata}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm text-[#888888]">
                Título del libro
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={handleChange}
                className="rounded-lg border-[#D0E2FF] bg-white px-4 py-2 text-[#222222] placeholder:text-[#CCCCCC] focus:border-[#FFA69E] focus:ring-[#FFA69E]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author" className="text-sm text-[#888888]">
                Autor
              </Label>
              <Input
                id="author"
                value={formData.author}
                onChange={handleChange}
                className="rounded-lg border-[#D0E2FF] bg-white px-4 py-2 text-[#222222] placeholder:text-[#CCCCCC] focus:border-[#FFA69E] focus:ring-[#FFA69E]"
                required
              />
            </div>

            {/* Metadata information */}
            {(formData.published_date || formData.publisher || formData.page_count) && (
              <div className="space-y-2">
                <Label className="text-sm text-[#888888]">Información de publicación</Label>
                <div className="rounded-lg bg-gray-50 p-3 text-sm">
                  {formData.published_date && (
                    <p className="text-gray-600">
                      <span className="font-medium">Fecha de publicación:</span> {formData.published_date}
                    </p>
                  )}
                  {formData.publisher && (
                    <p className="text-gray-600">
                      <span className="font-medium">Editorial:</span> {formData.publisher}
                    </p>
                  )}
                  {formData.page_count > 0 && (
                    <p className="text-gray-600">
                      <span className="font-medium">Páginas:</span> {formData.page_count}
                    </p>
                  )}
                  {formData.isbn && (
                    <p className="text-gray-600">
                      <span className="font-medium">ISBN:</span> {formData.isbn}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Categories */}
            {formData.categories && formData.categories.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-[#888888]">Categorías</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.categories.map((category, index) => (
                    <span key={index} className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {formData.description && (
              <div className="space-y-2">
                <Label className="text-sm text-[#888888]">Sinopsis</Label>
                <div className="rounded-lg bg-gray-50 p-3 text-sm">
                  <p className="text-gray-600">
                    {showFullDescription ? formData.description : truncateText(formData.description)}
                  </p>
                  {formData.description.length > 200 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-6 text-xs text-blue-500 hover:text-blue-700 flex items-center"
                      onClick={() => setShowFullDescription(!showFullDescription)}
                    >
                      {showFullDescription ? (
                        <>
                          <ChevronUp className="h-3 w-3 mr-1" /> Ver menos
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" /> Ver más
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {bookType === "read" && (
              <div className="space-y-2">
                <Label htmlFor="date_finished" className="text-sm text-[#888888]">
                  Fecha de finalización
                </Label>
                <Input
                  id="date_finished"
                  type="date"
                  value={formData.date_finished}
                  onChange={handleChange}
                  className="rounded-lg border-[#D0E2FF] bg-white px-4 py-2 text-[#222222] focus:border-[#FFA69E] focus:ring-[#FFA69E]"
                />
              </div>
            )}

            {bookType === "read" && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm text-[#888888]">Valoración</Label>
                  <StarRating rating={rating} setRating={setRating} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review" className="text-sm text-[#888888]">
                    Tus pensamientos
                  </Label>
                  <Textarea
                    id="review"
                    value={formData.review}
                    onChange={handleChange}
                    className="min-h-[100px] rounded-lg border-[#D0E2FF] bg-white px-4 py-2 text-[#222222] placeholder:text-[#CCCCCC] focus:border-[#FFA69E] focus:ring-[#FFA69E]"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {deleteError && (
          <div className="rounded-lg bg-red-500 p-4 text-white">
            <p>{deleteError}</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <Button
            type="submit"
            className="h-12 w-full rounded-full bg-[#D0E2FF] text-[#222222] hover:bg-[#FFA69E] transition-all duration-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Actualizando..." : "Actualizar libro"}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-full border-[#FFA69E] text-[#FFA69E] hover:bg-[#FFF0EE] transition-all duration-300"
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Eliminando..." : "Eliminar libro"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-xl bg-white">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-serif text-xl text-[#222222]">¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription className="text-[#888888]">
                  Esto eliminará permanentemente este libro de tu colección.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col space-y-2 sm:space-y-0">
                <AlertDialogAction
                  className="h-10 rounded-full bg-[#FFA69E] text-white hover:bg-[#FF8A7E] transition-all duration-300"
                  onClick={handleDelete}
                >
                  Sí, eliminar libro
                </AlertDialogAction>
                <AlertDialogCancel className="h-10 rounded-full border-[#888888] text-[#888888] hover:bg-[#F5F5F5] transition-all duration-300">
                  Cancelar
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Link href="/dashboard">
            <Button
              type="button"
              variant="ghost"
              className="h-12 w-full rounded-full text-[#888888] hover:bg-[#F5F5F5] transition-all duration-300"
            >
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </>
  )
}
