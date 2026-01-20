"use client"

import Image from "next/image"
import { AlbumSearchResult } from "@/services/musicApi"

interface AlbumSearchDropdownProps {
  results: AlbumSearchResult[]
  isLoading: boolean
  onSelect: (album: AlbumSearchResult) => void
  isOpen: boolean
}

export function AlbumSearchDropdown({ results, isLoading, onSelect, isOpen }: AlbumSearchDropdownProps) {
  if (!isOpen) return null

  return (
    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-[50vh] overflow-y-auto">
      {isLoading ? (
        <div className="p-4 text-center text-gray-500 font-mono text-sm">
          Buscando...
        </div>
      ) : results.length === 0 ? (
        <div className="p-4 text-center text-gray-500 font-mono text-sm">
          No se encontraron resultados
        </div>
      ) : (
        <div className="py-1">
          {results.map((album) => (
            <button
              key={`${album.source}-${album.id}`}
              onClick={() => onSelect(album)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 relative">
                  <Image
                    src={album.artwork_url}
                    alt={`${album.title} by ${album.artist}`}
                    fill
                    className="object-cover rounded"
                    sizes="48px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm font-medium text-gray-900 truncate">
                    {album.title}
                  </div>
                  <div className="font-mono text-xs text-gray-500 truncate">
                    {album.artist}
                    {album.release_year && (
                      <span className="ml-2">• {album.release_year}</span>
                    )}
                  </div>
                  <div className="font-mono text-xs text-gray-400 mt-1">
                    {album.source === 'itunes' ? 'iTunes' : 'MusicBrainz'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 