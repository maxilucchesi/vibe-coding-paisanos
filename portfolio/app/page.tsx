"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { login } from "@/lib/simple-auth"
import Image from "next/image"

export default function LoginPage() {
  const [key, setKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Check if today is International Book Day (April 23)
  const today = new Date()
  const isBookDay = today.getMonth() === 3 && today.getDate() === 23

  // Añadir metaetiquetas directamente al DOM para asegurar que Safari las lea
  useEffect(() => {
    // Verificar si ya existen las metaetiquetas para no duplicarlas
    if (!document.querySelector('link[rel="apple-touch-icon"]')) {
      const appleIcon = document.createElement("link")
      appleIcon.rel = "apple-touch-icon"
      appleIcon.sizes = "180x180"
      appleIcon.href = "/apple-icon.png"
      document.head.appendChild(appleIcon)
    }

    if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
      const appCapable = document.createElement("meta")
      appCapable.name = "apple-mobile-web-app-capable"
      appCapable.content = "yes"
      document.head.appendChild(appCapable)
    }

    if (!document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')) {
      const statusBar = document.createElement("meta")
      statusBar.name = "apple-mobile-web-app-status-bar-style"
      statusBar.content = "default"
      document.head.appendChild(statusBar)
    }

    if (!document.querySelector('meta[name="apple-mobile-web-app-title"]')) {
      const appTitle = document.createElement("meta")
      appTitle.name = "apple-mobile-web-app-title"
      appTitle.content = "Mis Lecturas"
      document.head.appendChild(appTitle)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (login(key)) {
        // Set a cookie for middleware authentication
        document.cookie = "auth-status=authenticated; path=/; max-age=604800; SameSite=Lax"

        // Use a short timeout to ensure the toast is visible before redirect
        setTimeout(() => {
          router.push("/dashboard")
        }, 100)
      } else {
        toast({
          title: "Clave incorrecta",
          description: "La clave que ingresaste no es correcta.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error during login:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al iniciar sesión. Por favor intenta nuevamente.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFCFB] p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 relative w-40 h-40">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Crabcito%20from%20iLoveIMG-yEFbbqtj44wMXRLvWTwIStxhOobHV9.png"
              alt="Cangrejito"
              width={160}
              height={160}
              className="animate-bounce-slow"
            />
          </div>
          <h1 className="font-serif text-4xl font-normal text-[#222222]">Hola Giuli :)</h1>
          <p className="mt-3 text-sm text-[#888888]">Tu viaje de lectura te espera</p>

          {/* International Book Day Message */}
          {isBookDay && (
            <div className="mt-4 p-3 bg-[#FFF0EE] rounded-lg border border-[#FFA69E] text-center animate-pulse">
              <p className="text-[#222222] font-medium">✨📚 ¡Feliz Día Internacional del Libro! 📚✨</p>
              <p className="text-sm text-[#888888] mt-1">
                Hoy los libros están de fiesta, ¿cuál invitarás a tu estantería?
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleLogin} className="mt-10 space-y-6">
          <div className="space-y-2">
            <Input
              className="h-12 rounded-full border-[#D0E2FF] bg-white px-5 text-[#222222] placeholder:text-[#888888] focus:border-[#FFA69E] focus:ring-[#FFA69E]"
              placeholder="Ingresa tu clave"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
              autoComplete="off"
            />
          </div>
          <Button
            type="submit"
            className="h-12 w-full rounded-full bg-[#FFA69E] text-white hover:bg-[#FF8A7E] transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </form>
      </div>
    </div>
  )
}
