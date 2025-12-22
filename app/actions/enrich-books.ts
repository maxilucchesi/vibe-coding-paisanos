"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase"
import { getUserId } from "@/lib/simple-auth"
import { searchBooks, extractBookInfo } from "@/lib/google-books"

export async function enrichBooksWithMetadataAction() {
  console.log("Iniciando enriquecimiento de libros con metadatos")

  try {
    // Obtener el ID de usuario
    const userId = getUserId()

    // Obtener todos los libros del usuario
    const supabase = createClient()
    const { data: books, error } = await supabase.from("books").select("*").eq("user_id", userId)

    if (error) {
      console.error("Error al obtener libros:", error)
      return {
        success: false,
        message: "Error al obtener libros de la base de datos",
        error: error.message,
      }
    }

    if (!books || books.length === 0) {
      return {
        success: true,
        message: "No hay libros para enriquecer",
        updated: 0,
        total: 0,
      }
    }

    console.log(`Encontrados ${books.length} libros para enriquecer`)

    // Resultados para seguimiento
    const results = {
      updated: 0,
      failed: 0,
      skipped: 0,
      details: [],
    }

    // Procesar cada libro
    for (const book of books) {
      // Verificar si el libro ya tiene metadatos
      if (book.thumbnail || book.description || book.published_date || book.publisher || book.isbn) {
        console.log(`Libro "${book.title}" ya tiene metadatos, omitiendo`)
        results.skipped++
        results.details.push({
          id: book.id,
          title: book.title,
          status: "skipped",
          reason: "already_has_metadata",
        })
        continue
      }

      try {
        // Buscar en Google Books
        const query = `${book.title} ${book.author}`
        console.log(`Buscando: "${query}"`)

        const searchResults = await searchBooks(query)

        if (!searchResults || searchResults.length === 0) {
          console.log(`No se encontraron resultados para "${query}"`)
          results.failed++
          results.details.push({
            id: book.id,
            title: book.title,
            status: "failed",
            reason: "no_results",
          })
          continue
        }

        // Tomar el primer resultado
        const firstResult = searchResults[0]
        const bookInfo = extractBookInfo(firstResult)

        // Actualizar el libro en la base de datos
        const { error: updateError } = await supabase
          .from("books")
          .update({
            published_date: bookInfo.publishedDate || null,
            description: bookInfo.description || null,
            categories: bookInfo.categories.length > 0 ? bookInfo.categories : null,
            thumbnail: bookInfo.thumbnail || null,
            page_count: bookInfo.pageCount || null,
            publisher: bookInfo.publisher || null,
            isbn: bookInfo.isbn || null,
          })
          .eq("id", book.id)

        if (updateError) {
          console.error(`Error al actualizar libro "${book.title}":`, updateError)
          results.failed++
          results.details.push({
            id: book.id,
            title: book.title,
            status: "failed",
            reason: "update_error",
            error: updateError.message,
          })
        } else {
          console.log(`Libro "${book.title}" actualizado con éxito`)
          results.updated++
          results.details.push({
            id: book.id,
            title: book.title,
            status: "updated",
            metadata: {
              thumbnail: bookInfo.thumbnail,
              publisher: bookInfo.publisher,
              publishedDate: bookInfo.publishedDate,
              pageCount: bookInfo.pageCount,
              isbn: bookInfo.isbn,
            },
          })
        }
      } catch (error) {
        console.error(`Error al procesar libro "${book.title}":`, error)
        results.failed++
        results.details.push({
          id: book.id,
          title: book.title,
          status: "failed",
          reason: "processing_error",
          error: error.message,
        })
      }

      // Pequeña pausa para no sobrecargar la API
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    // Revalidar rutas para reflejar los cambios
    revalidatePath("/dashboard")
    revalidatePath("/books")
    revalidatePath("/favorites")

    return {
      success: true,
      message: `Proceso completado. ${results.updated} libros actualizados, ${results.failed} fallidos, ${results.skipped} omitidos.`,
      updated: results.updated,
      failed: results.failed,
      skipped: results.skipped,
      total: books.length,
      details: results.details,
    }
  } catch (error) {
    console.error("Error en enrichBooksWithMetadataAction:", error)
    return {
      success: false,
      message: "Error al enriquecer libros con metadatos",
      error: String(error),
    }
  }
}
