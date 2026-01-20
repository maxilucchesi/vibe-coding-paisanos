"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Heart, Settings } from "lucide-react"
import { logout } from "@/lib/simple-auth"
import { toast } from "@/components/ui/use-toast"
import { ViewModeToggle } from "@/components/view-mode-toggle"

interface UserNavProps {
  viewMode?: "list" | "gallery"
  onViewModeChange?: (mode: "list" | "gallery") => void
}

export function UserNav({ viewMode, onViewModeChange }: UserNavProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = () => {
    setIsLoading(true)
    try {
      logout()
      router.push("/")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al cerrar sesión. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* User Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <span className="text-2xl">🦀</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Mi Perfil</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {viewMode && onViewModeChange && (
            <>
              <div className="px-2 py-1.5">
                <ViewModeToggle viewMode={viewMode} onChange={onViewModeChange} showLabels={true} />
              </div>
              <DropdownMenuSeparator />
            </>
          )}
          <Link href="/favorites">
            <DropdownMenuItem className="cursor-pointer">
              <Heart className="mr-2 h-4 w-4" />
              <span>Favoritos</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/admin">
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Administración</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem
            className="cursor-pointer text-red-500 focus:text-red-500"
            disabled={isLoading}
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isLoading ? "Cerrando sesión..." : "Cerrar sesión"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
