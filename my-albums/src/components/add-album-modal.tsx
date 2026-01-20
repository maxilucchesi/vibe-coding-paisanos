"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Album } from "@/types/album"
import { RatingStars } from "./rating-stars"
import { AlbumSearchDropdown } from "./album-search-dropdown"
import { musicApi, AlbumSearchResult } from "@/services/musicApi"

interface AddAlbumModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (album: Partial<Album>) => void
  editingAlbum?: Album | null
}

export function AddAlbumModal({ isOpen, onClose, onSave, editingAlbum }: AddAlbumModalProps) {
  const [searchQuery, setSearchQuery] = useState(editingAlbum ? `${editingAlbum.artist} ${editingAlbum.title}` : "")
  const [rating, setRating] = useState(editingAlbum?.rating || 0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<AlbumSearchResult[]>([])
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumSearchResult | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  // Search function
  const searchAlbums = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    setIsSearching(true)
    try {
      const results = await musicApi.searchAlbums(query)
      setSearchResults(results)
      setShowDropdown(true)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce(searchAlbums, 300),
    [searchAlbums]
  )

  // Effect to trigger search when query changes
  useEffect(() => {
    if (!editingAlbum && !selectedAlbum) { // Only search when adding new, not when editing, and not when album is already selected
      debouncedSearch(searchQuery)
    }
  }, [searchQuery, debouncedSearch, editingAlbum, selectedAlbum])

  // Clear search results when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchResults([])
      setShowDropdown(false)
      setSelectedAlbum(null)
    }
  }, [isOpen])

  const handleAlbumSelect = (album: AlbumSearchResult) => {
    setSelectedAlbum(album)
    setSearchQuery(`${album.artist} - ${album.title}`)
    setShowDropdown(false)
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      let albumData: Partial<Album>

      if (editingAlbum) {
        // Modo edición: solo actualizar el rating
        albumData = {
          ...editingAlbum,
          rating,
          updated_at: new Date().toISOString(),
        }
      } else {
        // Modo agregar: crear nuevo álbum
        if (!searchQuery.trim()) return

        if (selectedAlbum) {
          // Use selected album from search results
          console.log('Selected album for saving:', selectedAlbum)
          albumData = {
            id: Date.now().toString(),
            title: selectedAlbum.title,
            artist: selectedAlbum.artist,
            artwork_url: selectedAlbum.artwork_url,
            rating,
            itunes_id: selectedAlbum.source === 'itunes' ? selectedAlbum.external_id : undefined,
            musicbrainz_id: selectedAlbum.source === 'musicbrainz' ? selectedAlbum.external_id : undefined,
            release_year: selectedAlbum.release_year,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          console.log('Album data to save:', albumData)
        } else {
          // Manual entry fallback
          const [artist, ...titleParts] = searchQuery.split(' - ')
          const title = titleParts.join(' - ') || artist

          albumData = {
            id: Date.now().toString(),
            title: titleParts.length > 0 ? title : searchQuery,
            artist: titleParts.length > 0 ? artist : "Unknown Artist",
            artwork_url: "/placeholder.svg",
            rating,
            release_year: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        }
      }

      onSave(albumData)
      handleClose()
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    setSearchQuery("")
    setRating(0)
    setSearchResults([])
    setShowDropdown(false)
    setSelectedAlbum(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setSelectedAlbum(null)
    
    if (value.length < 2) {
      setShowDropdown(false)
      setSearchResults([])
    }
  }

  const handleInputFocus = () => {
    if (searchResults.length > 0 && !editingAlbum) {
      setShowDropdown(true)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md font-mono">
        <DialogHeader>
          <DialogTitle className="text-center font-normal">
            {editingAlbum ? "EDITAR ÁLBUM" : "AGREGAR ÁLBUM"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-0 pb-4">
          {editingAlbum ? (
            // Modo edición: solo mostrar info del álbum y rating
            <>
              <div className="text-center space-y-2">
                <div className="text-lg font-bold text-black">
                  {editingAlbum.title}
                </div>
                <div className="text-base italic text-black">
                  {editingAlbum.artist}
                </div>
                {editingAlbum.release_year && (
                  <div className="text-sm text-gray-600">
                    ({editingAlbum.release_year})
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-normal">Rating</Label>
                <div className="flex justify-center">
                  <RatingStars rating={rating} onChange={setRating} interactive size="xl" />
                </div>
              </div>
            </>
          ) : (
            // Modo agregar: mostrar búsqueda y rating
            <>
              <div className="space-y-2 relative">
                <Label htmlFor="search" className="text-sm font-normal">
                  Artista o Álbum
                </Label>
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur()
                    }
                  }}
                  placeholder="Buscar..."
                  className="font-mono"
                  disabled={isLoading}
                  enterKeyHint="done"
                />
                <AlbumSearchDropdown
                  results={searchResults}
                  isLoading={isSearching}
                  onSelect={handleAlbumSelect}
                  isOpen={showDropdown}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-normal">Rating</Label>
                <div className="flex justify-center">
                  <RatingStars rating={rating} onChange={setRating} interactive size="xl" />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleSave}
            disabled={editingAlbum ? isLoading : (!searchQuery.trim() || isLoading)}
            className="bg-black text-white hover:bg-gray-800 font-mono text-sm px-8"
          >
            {isLoading ? "GUARDANDO..." : "GUARDAR"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Debounce utility function
function debounce(func: (query: string) => Promise<void>, delay: number) {
  let timeoutId: NodeJS.Timeout
  return (query: string) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(query), delay)
  }
}
