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
import { ArrowLeft } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { createBookAction } from "@/app/actions"
import { isAuthenticated } from "@/lib/simple-auth"
import { ConnectionStatus } from "@/components/connection-status"

// Agregar una función para obtener la fecha actual en formato YYYY-MM-DD
const getCurrentDate = () => {
  const today = new Date()
  return today.toISOString().split("T")[0]
}

export function AddBookForm() {
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
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  // Modificar el handleSubmit para ejecutar el código del cliente
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
            // Usar eval para ejecutar el código del cliente
            // eslint-disable-next-line no-eval
            eval(result.clientSideCode)
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
          <h1 className="font-serif text-2xl font-normal text-[#222222]">Añadir un libro</h1>
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

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm text-[#888888]">
                  Título del libro
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="rounded-lg border-[#D0E2FF] bg-white px-4 py-2 text-[#222222] placeholder:text-[#CCCCCC] focus:border-[#FFA69E] focus:ring-[#FFA69E]"
                  placeholder="Ingresa el título del libro"
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
                  placeholder="Ingresa el nombre del autor"
                  required
                />
              </div>

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
            <Link href="/dashboard">
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-full border-[#888888] text-[#888888] hover:bg-[#F5F5F5] transition-all duration-300"
              >
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
