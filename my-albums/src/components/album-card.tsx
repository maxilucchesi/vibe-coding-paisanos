"use client"

import Image from "next/image"
import { useState } from "react"
import type { Album } from "@/types/album"
import { RatingStars } from "./rating-stars"
import { AlbumPlaceholder } from "./album-placeholder"

interface AlbumCardProps {
  album: Album
  onEdit?: (album: Album) => void
  priority?: boolean
}

export function AlbumCard({ album, onEdit, priority = false }: AlbumCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <div
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onEdit?.(album)}
    >
      <div className="aspect-square relative overflow-hidden bg-gray-50">
        {!imageError && album.artwork_url ? (
          <>
            <Image
              src={album.artwork_url || "/placeholder.svg"}
              alt={`${album.title} by ${album.artist}`}
              fill
              className="object-cover transition-all duration-200 group-hover:opacity-90"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16.66vw"
              onError={() => {
                setImageError(true)
              }}
              priority={priority}
            />


          </>
        ) : (
          <AlbumPlaceholder title={album.title} artist={album.artist} className="absolute inset-0" />
        )}



        {/* Info overlay */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent transition-opacity duration-200 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="text-white text-xs font-mono">
            <div className="font-medium truncate">{album.title}</div>
            <div className="opacity-80 truncate">{album.artist}</div>
            <div className="mt-1">
              <RatingStars rating={album.rating} size="sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
