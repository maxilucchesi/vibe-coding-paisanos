"use client"

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function AuthButton() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        <span>Cargando...</span>
      </div>
    )
  }

  if (user) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={signOut}
        className="h-8 w-8 p-0"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button 
      onClick={signInWithGoogle}
      variant="outline"
      size="sm"
      className="text-sm"
    >
      Iniciar sesión con Google
    </Button>
  )
} 