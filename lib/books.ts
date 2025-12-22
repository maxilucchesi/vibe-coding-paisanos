import { createClient } from "./supabase"
import { getUserId } from "./simple-auth"
import { getLocalBooks, initializeLocalStorage } from "./local-storage"

// Inicializar el almacenamiento local al cargar el módulo
if (typeof window !== "undefined") {
  // Ejecutar en el cliente después de un pequeño retraso para asegurar que todo esté cargado
  setTimeout(() => {
    initializeLocalStorage().catch(console.error)
  }, 1000)
}

// Obtener todos los libros del usuario
export async function getBooks() {
  try {
    // Primero intentamos obtener de localStorage (para modo offline)
    const localBooks = getLocalBooks()
    if (localBooks.length > 0) {
      return localBooks
    }

    // Si no hay datos locales, intentamos obtener de Supabase
    const supabase = createClient()
    const userId = getUserId()

    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching books:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getBooks:", error)
    return []
  }
}

// Obtener libros por tipo (read o wishlist)
export async function getBooksByType(type: "read" | "wishlist") {
  try {
    // Primero intentamos obtener de Supabase
    const supabase = createClient()
    const userId = getUserId()

    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("user_id", userId)
      .eq("type", type)
      .order("created_at", { ascending: false })

    if (error) {
      console.error(`Error fetching ${type} books from Supabase:`, error)
      // Si hay error, intentamos obtener de localStorage
      const localBooks = getLocalBooks()
      if (localBooks.length > 0) {
        console.log(`Falling back to local storage for ${type} books`)
        return localBooks.filter((book) => book.type === type)
      }
      return []
    }

    if (data && data.length > 0) {
      console.log(`Retrieved ${data.length} ${type} books from Supabase`)

      // Actualizar localStorage con los datos más recientes
      if (typeof window !== "undefined") {
        const localBooks = getLocalBooks()

        // Combinar libros locales con los de Supabase, priorizando los de Supabase
        const bookMap = new Map()

        // Primero añadir los libros locales que están pendientes de sincronización
        localBooks
          .filter((book) => book.pending_sync)
          .forEach((book) => {
            const key = book.id || book.local_id
            bookMap.set(key, book)
          })

        // Luego añadir todos los libros de Supabase, sobrescribiendo los locales si es necesario
        data.forEach((book) => {
          const key = book.id
          bookMap.set(key, { ...book, pending_sync: false })
        })

        // Convertir el mapa de vuelta a un array
        const mergedBooks = Array.from(bookMap.values())

        // Guardar en localStorage
        localStorage.setItem("giuli-books", JSON.stringify(mergedBooks))
      }

      return data
    }

    // Si no hay datos en Supabase, intentamos obtener de localStorage
    const localBooks = getLocalBooks()
    if (localBooks.length > 0) {
      console.log(`No Supabase data, using local storage for ${type} books`)
      return localBooks.filter((book) => book.type === type)
    }

    return []
  } catch (error) {
    console.error(`Error in getBooksByType:`, error)

    // En caso de error, intentamos obtener de localStorage
    const localBooks = getLocalBooks()
    if (localBooks.length > 0) {
      return localBooks.filter((book) => book.type === type)
    }

    return []
  }
}

// Obtener un libro por ID
export async function getBookById(id: string) {
  try {
    // Primero intentamos buscar en localStorage (para modo offline)
    const localBooks = getLocalBooks()
    const localBook = localBooks.find((book) => book.id === id || book.local_id === id)
    if (localBook) {
      return localBook
    }

    // Si no encontramos localmente, intentamos obtener de Supabase
    const supabase = createClient()
    const userId = getUserId()

    const { data, error } = await supabase.from("books").select("*").eq("id", id).eq("user_id", userId).single()

    if (error) {
      console.error("Error fetching book:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getBookById:", error)
    return null
  }
}

// Obtener libros favoritos (con rating 5)
export async function getFavoriteBooks() {
  try {
    // Intentamos obtener de Supabase primero
    const supabase = createClient()
    const userId = getUserId()

    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("user_id", userId)
      .eq("type", "read")
      .eq("rating", 5)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching favorite books from Supabase:", error)

      // Si hay error, intentamos obtener de localStorage
      const localBooks = getLocalBooks()
      if (localBooks.length > 0) {
        console.log("Falling back to local storage for favorite books")
        // Filtramos explícitamente para asegurarnos de que solo se devuelvan libros con rating 5
        return localBooks.filter((book) => book.type === "read" && book.rating === 5)
      }
      return []
    }

    if (data && data.length > 0) {
      console.log(`Retrieved ${data.length} favorite books from Supabase`)
      return data
    }

    // Si no hay datos en Supabase, intentamos obtener de localStorage
    const localBooks = getLocalBooks()
    if (localBooks.length > 0) {
      console.log("No Supabase data, using local storage for favorite books")
      // Filtramos explícitamente para asegurarnos de que solo se devuelvan libros con rating 5
      return localBooks.filter((book) => book.type === "read" && book.rating === 5)
    }

    return []
  } catch (error) {
    console.error("Error in getFavoriteBooks:", error)

    // En caso de error, intentamos obtener de localStorage
    const localBooks = getLocalBooks()
    if (localBooks.length > 0) {
      // Filtramos explícitamente para asegurarnos de que solo se devuelvan libros con rating 5
      return localBooks.filter((book) => book.type === "read" && book.rating === 5)
    }

    return []
  }
}
