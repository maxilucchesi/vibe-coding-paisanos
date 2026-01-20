import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/toaster"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata = {
  title: "Mis Lecturas",
  description: "Tu registro personal de lecturas",
  manifest: "/manifest.json",
  icons: {
    icon: "/crabcito.png",
    apple: "/apple-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Mis Lecturas",
    statusBarStyle: "default",
  },
    generator: 'v0.dev'
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFFEF5",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/crabcito.png" type="image/png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Mis Lecturas" />
        <meta name="theme-color" content="#FFFEF5" />
        <meta name="application-name" content="Mis Lecturas" />
        <meta name="msapplication-TileColor" content="#FFFEF5" />
        <meta name="msapplication-TileImage" content="/apple-icon.png" />
        <style>
          {`
            @font-face {
              font-family: 'Louize';
              src: url('/fonts/Louize-Regular.woff2') format('woff2');
              font-weight: normal;
              font-style: normal;
              font-display: swap;
            }
            
            .font-serif {
              font-family: 'Louize', Georgia, serif;
            }
          `}
        </style>
      </head>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
