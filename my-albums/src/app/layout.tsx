import type React from "react"
import type { Metadata } from "next"
import { Roboto_Mono } from "next/font/google"
import { AuthProvider } from "@/contexts/auth-context"
import "./globals.css"

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
})

export const metadata: Metadata = {
  title: "discvault",
  description: "Registra álbumes que escuchaste de principio a fin, califícalos y mantén tu historial de escucha personal. Con autenticación multi-usuario.",
  icons: {
    icon: '/images/cd-icon.png',
    shortcut: '/images/cd-icon.png',
    apple: '/images/cd-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${robotoMono.variable} font-mono antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
