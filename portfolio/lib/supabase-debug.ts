import { createClient } from "./supabase"
import { getUserId } from "./simple-auth"
// Importar la configuración
import { LOCAL_STORAGE_BOOKS_KEY } from "@/lib/config"

// Función para verificar la conexión a Supabase
export async function testSupabaseConnection() {
  try {
    console.log("Iniciando prueba de conexión a Supabase...")
    const supabase = createClient()

    // Intentar una consulta simple
    const { data, error } = await supabase.from("books").select("id").limit(1)

    if (error) {
      console.error("Error en la prueba de conexión:", error)
      return {
        success: false,
        error: "Error al conectar con Supabase",
        details: error,
      }
    }

    console.log("Conexión exitosa a Supabase:", data)
    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error("Excepción en la prueba de conexión:", error)
    return {
      success: false,
      error: "Error al conectar con Supabase",
      details: error,
    }
  }
}

// Función para verificar la estructura de la tabla books
export async function checkBooksTable() {
  try {
    console.log("Verificando tabla books...")
    const supabase = createClient()

    // Verificar si la tabla existe obteniendo una muestra
    const { data, error } = await supabase.from("books").select("*").limit(1)

    if (error) {
      console.error("Error al verificar tabla books:", error)
      return {
        success: false,
        message: "Error al verificar tabla books",
        error,
      }
    }

    console.log("Tabla books verificada:", data)
    return {
      success: true,
      message: "La tabla books existe",
      sample: data,
    }
  } catch (error) {
    console.error("Excepción al verificar tabla books:", error)
    return {
      success: false,
      message: "Error al verificar tabla books",
      error,
    }
  }
}

// Mejorar la función checkRLSPolicies para manejar el caso de la columna local_id
export async function checkRLSPolicies() {
  try {
    console.log("Probando políticas RLS...")
    const supabase = createClient()
    const userId = getUserId()

    console.log("ID de usuario para prueba RLS:", userId)

    // Primero verificar si la columna local_id existe
    const { data: columnData, error: columnError } = await supabase
      .from("information_schema.columns")
      .select("column_name")
      .eq("table_name", "books")
      .eq("column_name", "local_id")
      .single()

    const hasLocalIdColumn = !columnError && columnData

    console.log("¿Existe la columna local_id?", hasLocalIdColumn ? "Sí" : "No")

    // Intentar insertar un libro de prueba
    const testBook = {
      title: "Libro de prueba RLS",
      author: "Sistema",
      type: "read",
      user_id: userId,
    }

    // Agregar local_id solo si la columna existe
    if (hasLocalIdColumn) {
      testBook.local_id = `test-${Date.now()}`
    }

    console.log("Intentando insertar libro de prueba:", testBook)

    const { data, error } = await supabase.from("books").insert([testBook]).select()

    if (error) {
      console.error("Error al insertar libro de prueba (posible problema con RLS):", error)
      return {
        success: false,
        error: "Error al insertar un libro de prueba (posible problema con RLS)",
        details: error,
        hasLocalIdColumn,
      }
    }

    // Si llegamos aquí, la inserción fue exitosa, ahora eliminamos el libro de prueba
    console.log("Libro de prueba insertado correctamente:", data)

    if (data && data.length > 0) {
      const { error: deleteError } = await supabase.from("books").delete().eq("id", data[0].id)

      if (deleteError) {
        console.error("Error al eliminar libro de prueba:", deleteError)
      } else {
        console.log("Libro de prueba eliminado correctamente")
      }
    }

    return {
      success: true,
      message: "Las políticas RLS permiten insertar libros",
      hasLocalIdColumn,
    }
  } catch (error) {
    console.error("Excepción al probar políticas RLS:", error)
    return {
      success: false,
      error: "Error al probar políticas RLS",
      details: error,
    }
  }
}

// Función para verificar el ID de usuario
export async function checkUserId() {
  try {
    const userId = getUserId()
    console.log("ID de usuario actual:", userId)

    return {
      success: true,
      userId,
    }
  } catch (error) {
    console.error("Error al obtener ID de usuario:", error)
    return {
      success: false,
      error: "Error al obtener ID de usuario",
      details: error,
    }
  }
}

// Función para verificar el almacenamiento local
export function checkLocalStorage() {
  try {
    if (typeof window === "undefined") {
      return {
        success: false,
        error: "No se puede acceder al almacenamiento local en el servidor",
      }
    }

    const books = localStorage.getItem(LOCAL_STORAGE_BOOKS_KEY)
    const parsedBooks = books ? JSON.parse(books) : []
    const pendingBooks = parsedBooks.filter((book: any) => book.pending_sync)

    console.log("Libros en almacenamiento local:", parsedBooks.length)
    console.log("Libros pendientes de sincronización:", pendingBooks.length)

    return {
      success: true,
      totalBooks: parsedBooks.length,
      pendingBooks: pendingBooks.length,
      sample: parsedBooks.slice(0, 2), // Mostrar solo los primeros 2 libros como muestra
    }
  } catch (error) {
    console.error("Error al verificar almacenamiento local:", error)
    return {
      success: false,
      error: "Error al verificar almacenamiento local",
      details: error,
    }
  }
}

// Función para ejecutar todas las pruebas
export async function runAllTests() {
  const connection = await testSupabaseConnection()
  const table = await checkBooksTable()
  const rls = await checkRLSPolicies()
  const userId = await checkUserId()
  const localStorage =
    typeof window !== "undefined" ? checkLocalStorage() : { success: false, error: "Ejecutando en servidor" }

  return {
    connection,
    table,
    rls,
    userId,
    localStorage,
  }
}
