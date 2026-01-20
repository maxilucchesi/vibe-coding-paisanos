"use client"

export function DebugSession() {
  // Siempre retornar null para ocultar la información de depuración
  return null

  /* Código original comentado
  const [authInfo, setAuthInfo] = useState<{
    isAuthenticated: boolean
    userId: string
    lastChecked: string
  }>({
    isAuthenticated: false,
    userId: "",
    lastChecked: new Date().toISOString(),
  })

  useEffect(() => {
    const checkAuth = () => {
      setAuthInfo({
        isAuthenticated: isAuthenticated(),
        userId: getUserId(),
        lastChecked: new Date().toISOString(),
      })
    }

    checkAuth()

    // Configurar un intervalo para verificar la autenticación periódicamente
    const interval = setInterval(checkAuth, 5000)

    return () => clearInterval(interval)
  }, [])

  if (process.env.NODE_ENV === "production") {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 z-50 bg-black bg-opacity-80 text-white p-2 text-xs font-mono">
      <div>Auth: {authInfo.isAuthenticated ? "✅" : "❌"}</div>
      <div>User ID: {authInfo.userId}</div>
      <div>Last checked: {new Date(authInfo.lastChecked).toLocaleTimeString()}</div>
    </div>
  )
  */
}
