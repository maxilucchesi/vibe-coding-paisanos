"use client"

import { useState, useEffect } from "react"
import type { Album } from "@/types/album"
import { AlbumCard } from "./album-card"
import { AddAlbumModal } from "./add-album-modal"
import { AlbumInfoModal } from "./album-info-modal"
import { AuthButton } from "./auth-button"
import { useAuth } from "@/contexts/auth-context"
import { albumService } from "@/services/albumService"

export function AlbumGrid() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth()
  const [albums, setAlbums] = useState<Album[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)

  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load albums from Supabase on component mount and when user changes
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        loadAlbums()
      } else {
        setAlbums([])
        setIsLoading(false)
      }
    }
  }, [user, authLoading])

  const loadAlbums = async () => {
    try {
      setIsLoading(true)
      const data = await albumService.getAlbums()
      setAlbums(data)
    } catch (error) {
      console.error('Error loading albums:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddAlbum = () => {
    if (!user) {
      signInWithGoogle()
      return
    }
    setEditingAlbum(null)
    setIsAddModalOpen(true)
  }

  const handleSaveAlbum = async (albumData: Partial<Album>) => {
    if (!user) {
      console.error('User not authenticated')
      return
    }

    try {
      if (editingAlbum) {
        // Edit existing album
        const updatedAlbum = await albumService.updateAlbum(editingAlbum.id, albumData)
        if (updatedAlbum) {
          setAlbums((prev) => prev.map((album) => (album.id === editingAlbum.id ? updatedAlbum : album)))
        }
      } else {
        // Add new album
        const newAlbum = await albumService.addAlbum(
          albumData as Omit<Album, 'id' | 'created_at' | 'updated_at'>, 
          user.id
        )
        if (newAlbum) {
          setAlbums((prev) => [newAlbum, ...prev])
        }
      }
      setEditingAlbum(null)
    } catch (error) {
      console.error('Error saving album:', error)
    }
  }

  const handleEditAlbum = (album: Album) => {
    if (!user) {
      signInWithGoogle()
      return
    }
    setEditingAlbum(album)
    setIsAddModalOpen(true)
  }

  const handleShowInfo = (album: Album) => {
    setSelectedAlbum(album)
    setIsInfoModalOpen(true)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          <span className="font-mono text-sm">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        {user && (
          <div className="flex items-center justify-center mb-8 relative">
            <button
              onClick={handleAddAlbum}
              className="text-sm font-mono text-gray-600 hover:text-black transition-colors"
            >
              AGREGAR
            </button>
            <div className="absolute right-0">
              <AuthButton />
            </div>
          </div>
        )}

        {/* Content */}
        {!user ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="max-w-md space-y-8">
              <h1 className="text-3xl font-mono text-gray-900">
                discvault
              </h1>
              <div className="flex justify-center">
                <img 
                  src="/images/cd.png" 
                  alt="CD" 
                  className="w-48 h-48 object-contain"
                />
              </div>
              <div className="space-y-4">
                <p className="text-gray-800 font-mono text-sm">
                  Iniciar sesión
                </p>
                <button
                  onClick={() => signInWithGoogle()}
                  className="px-6 py-2 bg-black text-white font-mono text-sm hover:bg-gray-800 transition-colors rounded-md flex items-center gap-2 justify-center"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continuar con Google</span>
                </button>
              </div>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              <span className="font-mono text-sm">Cargando álbumes...</span>
            </div>
          </div>
        ) : albums.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="max-w-md space-y-4">
              <h2 className="text-xl font-mono text-gray-900">
                Tu colección está vacía
              </h2>
              <p className="text-gray-600">
                Agrega tu primer álbum para comenzar a construir tu biblioteca musical
              </p>
              <button
                onClick={handleAddAlbum}
                className="px-6 py-2 bg-black text-white font-mono text-sm hover:bg-gray-800 transition-colors"
              >
                Agregar álbum
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {albums.map((album, index) => (
              <AlbumCard
                key={album.id}
                album={album}
                onEdit={handleShowInfo}
                priority={index < 8}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddAlbumModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveAlbum}
        editingAlbum={editingAlbum}
      />

      <AlbumInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        album={selectedAlbum}
        onEdit={handleEditAlbum}
        onDelete={async (album) => {
          try {
            const success = await albumService.deleteAlbum(album.id)
            if (success) {
              setAlbums((prev) => prev.filter((a) => a.id !== album.id))
            }
          } catch (error) {
            console.error('Error deleting album:', error)
          }
        }}
      />


    </div>
  )
}
