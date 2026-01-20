import { createClient } from "./supabase"
import { getUserId } from "./simple-auth"
// Importar la configuración
import { LOCAL_STORAGE_BOOKS_KEY } from "@/lib/config"

// Tipo para los libros
export type LocalBook = {
  id?: string
  local_id: string
  title: string
  author: string
  type: "read" | "wishlist"
  rating?: number | null
  date_finished?: string | null
  review?: string | null
  created_at: string
  user_id: string
  pending_sync: boolean
}

// Obtener libros del almacenamiento local
export function getLocalBooks(): LocalBook[] {
  if (typeof window === "undefined") {
    console.log("getLocalBooks: Ejecutando en servidor, retornando array vacío")
    return []
  }

  try {
    const booksJson = localStorage.getItem(LOCAL_STORAGE_BOOKS_KEY)
    if (!booksJson) {
      console.log("getLocalBooks: No hay libros en localStorage")
      return []
    }
    const books = JSON.parse(booksJson)
    console.log(`getLocalBooks: Obtenidos ${books.length} libros de localStorage`)
    return books
  } catch (error) {
    console.error("Error al obtener libros del almacenamiento local:", error)
    return []
  }
}

// Guardar un libro en el almacenamiento local
export function saveBookToLocalStorage(book: LocalBook): void {
  if (typeof window === "undefined") {
    console.log("saveBookToLocalStorage: Ejecutando en servidor, no se puede guardar")
    return
  }

  try {
    console.log("saveBookToLocalStorage: Guardando libro en localStorage:", book)
    const books = getLocalBooks()

    // Verificar si el libro ya existe (por id o local_id)
    const existingIndex = books.findIndex(
      (b) => (book.id && b.id === book.id) || (book.local_id && b.local_id === book.local_id),
    )

    if (existingIndex >= 0) {
      // Actualizar libro existente
      console.log(`saveBookToLocalStorage: Actualizando libro existente en posición ${existingIndex}`)
      books[existingIndex] = { ...books[existingIndex], ...book }
    } else {
      // Añadir nuevo libro
      console.log("saveBookToLocalStorage: Añadiendo nuevo libro")
      books.push(book)
    }

    // Asegurarse de usar la clave correcta de localStorage
    localStorage.setItem(LOCAL_STORAGE_BOOKS_KEY, JSON.stringify(books))
    console.log(
      `saveBookToLocalStorage: Guardados ${books.length} libros en localStorage con clave ${LOCAL_STORAGE_BOOKS_KEY}`,
    )

    // Disparar un evento personalizado para notificar cambios
    if (typeof window.dispatchEvent === "function") {
      console.log("saveBookToLocalStorage: Disparando evento booksUpdated")
      window.dispatchEvent(new CustomEvent("booksUpdated", { detail: books }))
    }
  } catch (error) {
    console.error("Error al guardar libro en almacenamiento local:", error)
  }
}

// Sincronizar libros locales con Supabase
export async function syncLocalBooks(): Promise<{
  success: boolean
  synced: number
  failed: number
  details: any[]
}> {
  if (typeof window === "undefined") {
    console.log("syncLocalBooks: Ejecutando en servidor, no se puede sincronizar")
    return { success: false, synced: 0, failed: 0, details: [] }
  }

  try {
    const books = getLocalBooks()
    const pendingBooks = books.filter((book) => book.pending_sync)

    if (pendingBooks.length === 0) {
      console.log("No hay libros pendientes de sincronización")
      return { success: true, synced: 0, failed: 0, details: [] }
    }

    console.log(`Sincronizando ${pendingBooks.length} libros pendientes`)

    const supabase = createClient()
    const userId = getUserId()
    const results = []
    let syncedCount = 0
    let failedCount = 0

    // Procesar cada libro pendiente
    for (const book of pendingBooks) {
      try {
        if (book.id) {
          // Actualizar libro existente
          const { data, error } = await supabase
            .from("books")
            .update({
              title: book.title,
              author: book.author,
              type: book.type,
              rating: book.rating,
              date_finished: book.date_finished,
              review: book.review,
            })
            .eq("id", book.id)
            .eq("user_id", userId)
            .select()

          if (error) {
            console.error(`Error al actualizar libro ${book.id} en Supabase:`, error)
            results.push({ id: book.id, success: false, error })
            failedCount++
            continue
          }

          // Marcar como sincronizado
          book.pending_sync = false
          saveBookToLocalStorage(book)
          console.log(`Libro ${book.id} actualizado en Supabase`)
          results.push({ id: book.id, success: true, operation: "update" })
          syncedCount++
        } else {
          // Crear nuevo libro
          const { data, error } = await supabase
            .from("books")
            .insert([
              {
                title: book.title,
                author: book.author,
                type: book.type,
                rating: book.rating,
                date_finished: book.date_finished,
                review: book.review,
                user_id: userId,
                local_id: book.local_id,
              },
            ])
            .select()

          if (error) {
            console.error(`Error al crear libro ${book.local_id} en Supabase:`, error)
            results.push({ local_id: book.local_id, success: false, error })
            failedCount++
            continue
          }

          // Actualizar con el ID de Supabase y marcar como sincronizado
          book.id = data[0].id
          book.pending_sync = false
          saveBookToLocalStorage(book)
          console.log(`Libro ${book.local_id} creado en Supabase con ID ${book.id}`)
          results.push({ local_id: book.local_id, id: book.id, success: true, operation: "insert" })
          syncedCount++
        }
      } catch (error) {
        console.error(`Error al sincronizar libro ${book.local_id || book.id}:`, error)
        results.push({ id: book.id, local_id: book.local_id, success: false, error })
        failedCount++
      }
    }

    console.log("Sincronización completada")
    return {
      success: failedCount === 0,
      synced: syncedCount,
      failed: failedCount,
      details: results,
    }
  } catch (error) {
    console.error("Error en syncLocalBooks:", error)
    return {
      success: false,
      synced: 0,
      failed: 0,
      details: [{ error }],
    }
  }
}

// Inicializar almacenamiento local con datos de Supabase
export async function initializeLocalStorage(): Promise<{
  success: boolean
  count: number
  error?: any
}> {
  if (typeof window === "undefined") {
    console.log("initializeLocalStorage: Ejecutando en servidor, no se puede inicializar")
    return { success: false, count: 0 }
  }

  try {
    // Verificar si ya tenemos datos locales
    const localBooks = getLocalBooks()
    if (localBooks.length > 0) {
      console.log("Almacenamiento local ya inicializado con", localBooks.length, "libros")
      return { success: true, count: localBooks.length }
    }

    console.log("Inicializando almacenamiento local desde Supabase")

    const supabase = createClient()
    const userId = getUserId()

    const { data, error } = await supabase.from("books").select("*").eq("user_id", userId)

    if (error) {
      console.error("Error al obtener libros de Supabase:", error)
      return { success: false, count: 0, error }
    }

    if (!data || data.length === 0) {
      console.log("No hay libros en Supabase para inicializar")
      return { success: true, count: 0 }
    }

    // Convertir a formato local y guardar
    const booksToSave = data.map((book) => ({
      ...book,
      local_id: book.local_id || `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      pending_sync: false,
    }))

    localStorage.setItem(LOCAL_STORAGE_BOOKS_KEY, JSON.stringify(booksToSave))
    console.log(`Almacenamiento local inicializado con ${booksToSave.length} libros`)

    // Disparar un evento personalizado para notificar cambios
    if (typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new CustomEvent("booksUpdated", { detail: booksToSave }))
    }

    return { success: true, count: booksToSave.length }
  } catch (error) {
    console.error("Error en initializeLocalStorage:", error)
    return { success: false, count: 0, error }
  }
}
