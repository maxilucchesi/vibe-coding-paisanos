"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { StarRating } from "@/components/star-rating"
import { ArrowLeft, Edit2, ChevronDown, ChevronUp } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { createBookAction } from "@/app/actions"
import { isAuthenticated } from "@/lib/simple-auth"
import { ConnectionStatus } from "@/components/connection-status"
import { BookSearch } from "@/components/book-search"
import type { extractBookInfo } from "@/lib/google-books"

// Agregar una función para obtener la fecha actual en formato YYYY-MM-DD
const getCurrentDate = () => {
  const today = new Date()
  return today.toISOString().split("T")[0]
}

export function AddBookFormWithSearch() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookType, setBookType] = useState("read")
  const [rating, setRating] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    date_finished: getCurrentDate(),
    review: "",
    // Nuevos campos de metadata
    published_date: "",
    description: "",
    categories: [] as string[],
    thumbnail: "",
    page_count: 0,
    publisher: "",
    isbn: "",
  })

  // Estado para controlar si se ha seleccionado un libro
  const [hasSelectedBook, setHasSelectedBook] = useState(false)

  // Estados para controlar la edición de campos
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingAuthor, setEditingAuthor] = useState(false)

  // Estado para controlar la expansión de la sinopsis
  const [showFullDescription, setShowFullDescription] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  // Función para manejar la selección de un libro
  const handleSelectBook = (bookInfo: ReturnType<typeof extractBookInfo>) => {
    setFormData({
      ...formData,
      title: bookInfo.title,
      author: bookInfo.author,
      published_date: bookInfo.publishedDate,
      description: bookInfo.description,
      categories: bookInfo.categories,
      thumbnail: bookInfo.thumbnail,
      page_count: bookInfo.pageCount,
      publisher: bookInfo.publisher,
      isbn: bookInfo.isbn,
    })
    setHasSelectedBook(true)
    // Resetear estados de edición
    setEditingTitle(false)
    setEditingAuthor(false)
    setShowFullDescription(false)
  }

  // Función para truncar texto largo
  const truncateText = (text: string, maxLength = 200) => {
    if (!text || text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // Verificar autenticación
      if (!isAuthenticated()) {
        throw new Error("Debes iniciar sesión para guardar un libro")
      }

      // Validar campos requeridos
      if (!formData.title.trim()) {
        throw new Error("El título del libro es obligatorio")
      }

      if (!formData.author.trim()) {
        throw new Error("El autor del libro es obligatorio")
      }

      // Preparar los datos según el tipo de libro
      const bookData = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        type: bookType as "read" | "wishlist",
        ...(bookType === "read" && {
          rating: rating > 0 ? rating : null,
          date_finished: formData.date_finished || null,
          review: formData.review.trim() || null,
        }),
        // Incluir metadata
        published_date: formData.published_date || null,
        description: formData.description || null,
        categories: formData.categories.length > 0 ? formData.categories : null,
        thumbnail: formData.thumbnail || null,
        page_count: formData.page_count > 0 ? formData.page_count : null,
        publisher: formData.publisher || null,
        isbn: formData.isbn || null,
      }

      console.log("Enviando datos del libro:", bookData)

      // Mostrar toast de éxito antes de la redirección
      toast({
        title: "Guardando libro...",
        description: "Tu libro está siendo guardado.",
      })

      // Usar el Server Action para crear el libro
      const result = await createBookAction(bookData)
      console.log("Resultado de createBookAction:", result)

      if (result.success) {
        // Ejecutar el código del cliente para guardar en localStorage
        if (result.clientSideCode) {
          try {
            // Guardar directamente en localStorage desde el cliente
            const localBook = {
              ...result.book,
              pending_sync: true,
            }
            const books = JSON.parse(localStorage.getItem("giuli-books") || "[]")
            books.push(localBook)
            localStorage.setItem("giuli-books", JSON.stringify(books))
            console.log("Libro guardado en localStorage desde el cliente:", localBook)

            // Disparar evento de actualización
            window.dispatchEvent(new CustomEvent("booksUpdated", { detail: books }))
          } catch (localStorageError) {
            console.error("Error al guardar en localStorage desde el cliente:", localStorageError)
          }
        }

        setSuccess(result.message)
        toast({
          title: "¡Libro guardado!",
          description: result.message,
        })

        // Limpiar el formulario
        setFormData({
          title: "",
          author: "",
          date_finished: getCurrentDate(),
          review: "",
          published_date: "",
          description: "",
          categories: [],
          thumbnail: "",
          page_count: 0,
          publisher: "",
          isbn: "",
        })
        setRating(0)

        // Esperar un momento antes de redirigir
        setTimeout(() => {
          router.push("/dashboard")
          router.refresh() // Forzar actualización de los datos
        }, 1500)
      } else {
        throw new Error(result.message || "Error al guardar el libro")
      }
    } catch (error) {
      console.error("Error saving book:", error)

      // Mostrar el mensaje de error
      const errorMessage =
        error instanceof Error ? error.message : "Hubo un problema al guardar tu libro. Por favor, inténtalo de nuevo."

      setError(errorMessage)

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] p-6">
      <div className="mx-auto max-w-md">
        <header className="mb-8 flex items-center">
          <Link href="/dashboard" className="mr-4">
            <ArrowLeft className="h-5 w-5 text-[#888888]" />
          </Link>
          <h1 className="font-serif text-2xl font-normal text-[#222222]">
            {hasSelectedBook ? "Completar detalles" : "Buscar un libro"}
          </h1>
        </header>

        {/* Componente de estado de conexión */}
        <ConnectionStatus />

        {error && (
          <div className="mb-6 rounded-lg bg-red-500 p-4 text-white">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-green-500 p-4 text-white">
            <p>{success}</p>
          </div>
        )}

        {!hasSelectedBook ? (
          // Mostrar solo la búsqueda si no se ha seleccionado un libro
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4 text-[#222222]">Busca un libro para añadir</h2>
            <BookSearch onSelectBook={handleSelectBook} initialQuery="" />

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 mb-2">¿No encuentras el libro que buscas?</p>
              <Button variant="outline" className="text-[#FFA69E]" onClick={() => setHasSelectedBook(true)}>
                Añadir manualmente
              </Button>
            </div>
          </div>
        ) : (
          // Mostrar el formulario completo una vez seleccionado un libro
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <RadioGroup
                defaultValue="read"
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

              {/* Previsualización de la portada si está disponible */}
              {formData.thumbnail && (
                <div className="mb-6 flex justify-center">
                  <img
                    src={formData.thumbnail || "/placeholder.svg"}
                    alt={formData.title}
                    className="h-52 rounded-md shadow-md"
                  />
                </div>
              )}

              <div className="space-y-6">
                {/* Título del libro (con opción de edición) */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm text-[#888888]">
                    Título del libro
                  </Label>
                  {editingTitle ? (
                    <div className="relative">
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="rounded-lg border-[#D0E2FF] bg-white px-4 py-2 text-[#222222] placeholder:text-[#CCCCCC] focus:border-[#FFA69E] focus:ring-[#FFA69E]"
                        placeholder="Ingresa el título del libro"
                        required
                        autoFocus
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400"
                        onClick={() => setEditingTitle(false)}
                      >
                        ✓
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-lg border border-transparent bg-gray-50 px-4 py-2">
                      <p className="text-[#222222] font-medium">{formData.title || "Sin título"}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-[#FFA69E]"
                        onClick={() => setEditingTitle(true)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Autor (con opción de edición) */}
                <div className="space-y-2">
                  <Label htmlFor="author" className="text-sm text-[#888888]">
                    Autor
                  </Label>
                  {editingAuthor ? (
                    <div className="relative">
                      <Input
                        id="author"
                        value={formData.author}
                        onChange={handleChange}
                        className="rounded-lg border-[#D0E2FF] bg-white px-4 py-2 text-[#222222] placeholder:text-[#CCCCCC] focus:border-[#FFA69E] focus:ring-[#FFA69E]"
                        placeholder="Ingresa el nombre del autor"
                        required
                        autoFocus
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400"
                        onClick={() => setEditingAuthor(false)}
                      >
                        ✓
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-lg border border-transparent bg-gray-50 px-4 py-2">
                      <p className="text-[#222222]">{formData.author || "Sin autor"}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-[#FFA69E]"
                        onClick={() => setEditingAuthor(true)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Información adicional de Google Books */}
                {(formData.published_date || formData.publisher) && (
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

                {/* Categorías */}
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

                {/* Descripción (colapsable) */}
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
                        placeholder="Escribe tus pensamientos sobre este libro..."
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Button
                type="submit"
                className="h-12 w-full rounded-full bg-[#D0E2FF] text-[#222222] hover:bg-[#FFA69E] transition-all duration-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Guardando..." : "Guardar libro"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-full border-[#888888] text-[#888888] hover:bg-[#F5F5F5] transition-all duration-300"
                onClick={() => setHasSelectedBook(false)}
              >
                Buscar otro libro
              </Button>

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
        )}
      </div>
    </div>
  )
}
