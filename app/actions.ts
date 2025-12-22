"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase"
import { getUserId } from "@/lib/simple-auth"
import { testSupabaseConnection, checkUserId } from "@/lib/supabase-debug"

async function revalidateBookPages() {
  revalidatePath("/")
  revalidatePath("/dashboard")
  revalidatePath("/books")
  revalidatePath("/favorites")
}

// Modificar la función createBookAction para incluir los nuevos campos
export async function createBookAction(book: any) {
  console.log("Iniciando createBookAction con datos:", JSON.stringify(book, null, 2))

  try {
    // Validar datos del libro
    if (!book.title || !book.title.trim()) {
      throw new Error("El título del libro es obligatorio")
    }

    if (!book.author || !book.author.trim()) {
      throw new Error("El autor del libro es obligatorio")
    }

    // Verificar la conexión a Supabase antes de continuar
    const connectionTest = await testSupabaseConnection()
    console.log("Resultado de prueba de conexión:", connectionTest)

    if (!connectionTest.success) {
      console.error("Problema de conexión con Supabase:", connectionTest.error)
      // Continuamos para guardar en localStorage, pero registramos el error
    }

    // Obtener el ID de usuario
    const userIdCheck = await checkUserId()
    console.log("Verificación de ID de usuario:", userIdCheck)

    const userId = getUserId()
    console.log("ID de usuario para el nuevo libro:", userId)

    // Sanitizar datos para asegurar que los campos opcionales sean null y no undefined
    const sanitizedBook = {
      title: book.title.trim(),
      author: book.author.trim(),
      type: book.type,
      rating: book.rating || null,
      date_finished: book.date_finished || null,
      review: book.review ? book.review.trim() : null,
      user_id: userId,
      local_id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      pending_sync: true,
      created_at: new Date().toISOString(),
      // Nuevos campos de metadata
      published_date: book.published_date || null,
      description: book.description || null,
      categories: book.categories || null,
      thumbnail: book.thumbnail || null,
      page_count: book.page_count || null,
      publisher: book.publisher || null,
      isbn: book.isbn || null,
    }

    console.log("Datos sanitizados:", JSON.stringify(sanitizedBook, null, 2))

    // Guardar el libro en localStorage (modo offline-first)
    // Nota: Esta parte no funcionará en el servidor, solo en el cliente
    console.log("Intentando guardar en localStorage...")

    // Crear una función para guardar en localStorage que se ejecutará en el cliente
    const clientSideCode = `
      try {
        const book = ${JSON.stringify(sanitizedBook)};
        const books = JSON.parse(localStorage.getItem("giuli-books") || "[]");
        books.push(book);
        localStorage.setItem("giuli-books", JSON.stringify(books));
        console.log("Libro guardado en localStorage desde el cliente:", book);
        
        // Disparar evento de actualización
        window.dispatchEvent(new CustomEvent("booksUpdated", { detail: books }));
      } catch (error) {
        console.error("Error al guardar en localStorage desde el cliente:", error);
      }
    `

    // Intentar guardar en Supabase
    let supabaseSuccess = false
    try {
      const supabase = createClient()

      console.log("Intentando insertar en Supabase con cliente:", supabase)

      const { data, error } = await supabase
        .from("books")
        .insert([
          {
            title: sanitizedBook.title,
            author: sanitizedBook.author,
            type: sanitizedBook.type,
            rating: sanitizedBook.rating,
            date_finished: sanitizedBook.date_finished,
            review: sanitizedBook.review,
            user_id: sanitizedBook.user_id,
            local_id: sanitizedBook.local_id,
            // Nuevos campos de metadata
            published_date: sanitizedBook.published_date,
            description: sanitizedBook.description,
            categories: sanitizedBook.categories,
            thumbnail: sanitizedBook.thumbnail,
            page_count: sanitizedBook.page_count,
            publisher: sanitizedBook.publisher,
            isbn: sanitizedBook.isbn,
          },
        ])
        .select()

      if (error) {
        console.error("Error al crear libro en Supabase:", error)
        // No lanzamos error aquí, continuamos con el flujo
      } else {
        console.log("Libro creado con éxito en Supabase:", data)
        supabaseSuccess = true

        // Actualizar el código del cliente para marcar como sincronizado
        if (data && data.length > 0) {
          const clientSideUpdateCode = `
            try {
              const books = JSON.parse(localStorage.getItem("giuli-books") || "[]");
              const index = books.findIndex(b => b.local_id === "${sanitizedBook.local_id}");
              if (index >= 0) {
                books[index] = {...books[index], id: "${data[0].id}", pending_sync: false};
                localStorage.setItem("giuli-books", JSON.stringify(books));
                console.log("Libro actualizado en localStorage con ID de Supabase:", books[index]);
              }
            } catch (error) {
              console.error("Error al actualizar libro en localStorage:", error);
            }
          `
        }
      }
    } catch (supabaseError) {
      console.error("Error al conectar con Supabase:", supabaseError)
      // No lanzamos error aquí, continuamos con el flujo
    }

    // Revalidar rutas después de la inserción
    await revalidateBookPages()

    // Devolver resultado antes de la redirección
    return {
      success: true,
      supabaseSuccess,
      book: sanitizedBook,
      clientSideCode, // Incluir el código para ejecutar en el cliente
      message: supabaseSuccess
        ? "Libro guardado en Supabase y localmente"
        : "Libro guardado localmente, pendiente de sincronización",
    }
  } catch (error) {
    console.error("Error en createBookAction:", error)
    throw error
  }
}

// Añadir las siguientes funciones después de createBookAction y antes de syncPendingBooksAction

// Función para actualizar un libro existente
export async function updateBookAction(bookId: string, bookData: any) {
  console.log("Iniciando updateBookAction con ID:", bookId, "y datos:", JSON.stringify(bookData, null, 2))

  try {
    // Validar datos del libro
    if (!bookData.title || !bookData.title.trim()) {
      throw new Error("El título del libro es obligatorio")
    }

    if (!bookData.author || !bookData.author.trim()) {
      throw new Error("El autor del libro es obligatorio")
    }

    // Obtener el ID de usuario
    const userId = getUserId()
    console.log("ID de usuario para actualizar libro:", userId)

    // Sanitizar datos para asegurar que los campos opcionales sean null y no undefined
    const sanitizedBook = {
      title: bookData.title.trim(),
      author: bookData.author.trim(),
      type: bookData.type,
      rating: bookData.rating || null,
      date_finished: bookData.date_finished || null,
      review: bookData.review ? bookData.review.trim() : null,
      // Nuevos campos de metadata
      published_date: bookData.published_date || null,
      description: bookData.description || null,
      categories: bookData.categories || null,
      thumbnail: bookData.thumbnail || null,
      page_count: bookData.page_count || null,
      publisher: bookData.publisher || null,
      isbn: bookData.isbn || null,
    }

    console.log("Datos sanitizados para actualización:", JSON.stringify(sanitizedBook, null, 2))

    // Intentar actualizar en Supabase
    let supabaseSuccess = false
    try {
      const supabase = createClient()

      console.log("Intentando actualizar en Supabase con ID:", bookId)

      const { data, error } = await supabase
        .from("books")
        .update(sanitizedBook)
        .eq("id", bookId)
        .eq("user_id", userId)
        .select()

      if (error) {
        console.error("Error al actualizar libro en Supabase:", error)
        // No lanzamos error aquí, continuamos con el flujo
      } else {
        console.log("Libro actualizado con éxito en Supabase:", data)
        supabaseSuccess = true
      }
    } catch (supabaseError) {
      console.error("Error al conectar con Supabase para actualización:", supabaseError)
      // No lanzamos error aquí, continuamos con el flujo
    }

    // Revalidar rutas después de la actualización
    await revalidateBookPages()

    // Devolver resultado
    return {
      success: true,
      supabaseSuccess,
      message: supabaseSuccess
        ? "Libro actualizado en Supabase y localmente"
        : "Libro actualizado localmente, pendiente de sincronización",
      // Incluir código para actualizar localStorage en el cliente
      clientSideCode: `
        try {
          const books = JSON.parse(localStorage.getItem("giuli-books") || "[]");
          const index = books.findIndex(b => b.id === "${bookId}" || b.local_id === "${bookId}");
          
          if (index >= 0) {
            books[index] = {
              ...books[index],
              ...${JSON.stringify(sanitizedBook)},
              pending_sync: ${!supabaseSuccess}
            };
            localStorage.setItem("giuli-books", JSON.stringify(books));
            console.log("Libro actualizado en localStorage:", books[index]);
            
            // Disparar evento de actualización
            window.dispatchEvent(new CustomEvent("booksUpdated", { detail: books }));
          }
        } catch (error) {
          console.error("Error al actualizar en localStorage:", error);
        }
      `,
    }
  } catch (error) {
    console.error("Error en updateBookAction:", error)
    throw error
  }
}

// Función para eliminar un libro
export async function deleteBookAction(bookId: string) {
  console.log("Iniciando deleteBookAction con ID:", bookId)

  try {
    // Obtener el ID de usuario
    const userId = getUserId()
    console.log("ID de usuario para eliminar libro:", userId)

    // Intentar eliminar de Supabase
    let supabaseSuccess = false
    try {
      const supabase = createClient()

      console.log("Intentando eliminar de Supabase con ID:", bookId)

      const { error } = await supabase.from("books").delete().eq("id", bookId).eq("user_id", userId)

      if (error) {
        console.error("Error al eliminar libro de Supabase:", error)
        // No lanzamos error aquí, continuamos con el flujo
      } else {
        console.log("Libro eliminado con éxito de Supabase")
        supabaseSuccess = true
      }
    } catch (supabaseError) {
      console.error("Error al conectar con Supabase para eliminación:", supabaseError)
      // No lanzamos error aquí, continuamos con el flujo
    }

    // Revalidar rutas después de la eliminación
    await revalidateBookPages()

    // Devolver resultado
    return {
      success: true,
      supabaseSuccess,
      message: supabaseSuccess ? "Libro eliminado de Supabase y localmente" : "Libro eliminado localmente",
      // Incluir código para eliminar del localStorage en el cliente
      clientSideCode: `
        try {
          const books = JSON.parse(localStorage.getItem("giuli-books") || "[]");
          const filteredBooks = books.filter(b => b.id !== "${bookId}" && b.local_id !== "${bookId}");
          localStorage.setItem("giuli-books", JSON.stringify(filteredBooks));
          console.log("Libro eliminado de localStorage, quedan:", filteredBooks.length);
          
          // Disparar evento de actualización
          window.dispatchEvent(new CustomEvent("booksUpdated", { 
            detail: { action: "delete", id: "${bookId}" }
          }));
        } catch (error) {
          console.error("Error al eliminar de localStorage:", error);
        }
      `,
    }
  } catch (error) {
    console.error("Error en deleteBookAction:", error)
    throw error
  }
}

// Función para sincronizar libros pendientes
export async function syncPendingBooksAction() {
  console.log("Iniciando sincronización de libros pendientes")

  try {
    // Importar la función de sincronización desde el módulo local-storage
    const { syncLocalBooks } = await import("@/lib/local-storage")

    // Ejecutar la sincronización
    const result = await syncLocalBooks()

    // Revalidar rutas después de la sincronización
    revalidatePath("/dashboard")
    revalidatePath("/books")
    revalidatePath("/favorites")

    console.log("Resultado de sincronización:", result)

    return {
      success: result.success,
      message: result.success
        ? `Se sincronizaron ${result.synced} libros correctamente`
        : `Error al sincronizar. ${result.synced} sincronizados, ${result.failed} fallidos`,
      details: result,
    }
  } catch (error) {
    console.error("Error en syncPendingBooksAction:", error)

    return {
      success: false,
      message: "Error al sincronizar libros pendientes",
      error: String(error),
    }
  }
}
