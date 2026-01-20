"use client"

import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { RatingStars } from "./rating-stars"
import type { Album } from "@/types/album"

interface AlbumInfoModalProps {
  album: Album | null
  isOpen: boolean
  onClose: () => void
  onEdit: (album: Album) => void
  onDelete: (album: Album) => void
}

export function AlbumInfoModal({ album, isOpen, onClose, onEdit, onDelete }: AlbumInfoModalProps) {
  if (!album) return null

  const handleEdit = () => {
    onEdit(album)
    onClose()
  }

  const handleDelete = () => {
    onDelete(album)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md font-mono">
        <DialogHeader>
          <DialogTitle className="sr-only">Información del álbum</DialogTitle>
        </DialogHeader>

        <div className="text-center space-y-4 py-4">
          {/* Album Title */}
          <div className="text-black font-bold text-lg">
            {album.title}
          </div>

          {/* Artist */}
          <div className="text-black font-normal text-base italic">
            {album.artist}
          </div>

          {/* Year */}
          {album.release_year && (
            <div className="text-gray-600 font-normal text-sm">
              ({album.release_year})
            </div>
          )}

          {/* Rating */}
          <div className="flex justify-center py-2">
            <RatingStars rating={album.rating} size="md" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-12 pt-4">
          <button
            onClick={handleEdit}
            className="text-black hover:opacity-70 font-mono text-sm transition-opacity"
          >
            EDITAR
          </button>
          <button
            onClick={handleDelete}
            className="text-black hover:opacity-70 font-mono text-sm transition-opacity"
          >
            BORRAR
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 