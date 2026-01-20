"use client"

export function DebugPanel() {
  // Siempre retornar null para ocultar el panel de depuración
  return null

  /* Código original comentado
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>({})

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV === "production" && !isVisible) {
    return null
  }

  const runDiagnostics = async () => {
    setIsLoading(true)
    setResults({})

    try {
      // Probar conexión a Supabase
      const connectionResult = await testSupabaseConnection()
      setResults((prev) => ({ ...prev, connection: connectionResult }))

      // Si la conexión es exitosa, verificar la tabla books
      if (connectionResult.success) {
        const tableResult = await checkBooksTable()
        setResults((prev) => ({ ...prev, table: tableResult }))

        // Verificar políticas RLS
        const rlsResult = await checkRLSPolicies()
        setResults((prev) => ({ ...prev, rls: rlsResult }))
      }
    } catch (error) {
      console.error("Error en diagnóstico:", error)
      setResults((prev) => ({ ...prev, error }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    setIsLoading(true)
    try {
      const result = await syncPendingBooksAction()

      if (result.success) {
        toast({
          title: "Sincronización completada",
          description: result.message,
        })
      } else {
        toast({
          title: "Error de sincronización",
          description: result.message,
          variant: "destructive",
        })
      }

      setResults((prev) => ({ ...prev, sync: result }))
    } catch (error) {
      console.error("Error al sincronizar:", error)
      toast({
        title: "Error de sincronización",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4">
      {!isVisible ? (
        <Button
          size="sm"
          variant="outline"
          className="bg-black bg-opacity-80 text-white border-gray-700"
          onClick={() => setIsVisible(true)}
        >
          <Bug className="h-4 w-4 mr-1" />
          Debug
        </Button>
      ) : (
        <div className="bg-black bg-opacity-80 text-white p-4 rounded-lg border border-gray-700 w-80 max-h-96 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Panel de Diagnóstico</h3>
            <Button size="sm" variant="ghost" onClick={() => setIsVisible(false)}>
              Cerrar
            </Button>
          </div>

          <div className="space-y-2 mb-4">
            <Button size="sm" variant="outline" className="w-full" onClick={runDiagnostics} disabled={isLoading}>
              {isLoading && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
              <Database className="h-3 w-3 mr-1" />
              Diagnosticar Supabase
            </Button>

            <Button size="sm" variant="outline" className="w-full" onClick={handleSync} disabled={isLoading}>
              {isLoading && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
              <RefreshCw className="h-3 w-3 mr-1" />
              Forzar Sincronización
            </Button>
          </div>

          {Object.keys(results).length > 0 && (
            <div className="text-xs font-mono">
              <h4 className="font-medium mb-1">Resultados:</h4>
              <pre className="whitespace-pre-wrap break-all">{JSON.stringify(results, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
  */
}
