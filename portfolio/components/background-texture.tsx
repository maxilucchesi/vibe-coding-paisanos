"use client"

import { useEffect } from "react"

export function BackgroundTexture() {
  useEffect(() => {
    // Asegurarse de que la textura se aplique al html y body
    document.documentElement.style.backgroundColor = "#fffef5"
    document.documentElement.style.backgroundImage = 'url("/textures/argyle.png")'
    document.documentElement.style.backgroundRepeat = "repeat"

    // Asegurarse de que el body no tenga un fondo que oculte la textura
    document.body.style.backgroundColor = "transparent"

    return () => {
      // Limpiar estilos al desmontar
      document.documentElement.style.backgroundColor = ""
      document.documentElement.style.backgroundImage = ""
      document.documentElement.style.backgroundRepeat = ""
      document.body.style.backgroundColor = ""
    }
  }, [])

  return null
}
