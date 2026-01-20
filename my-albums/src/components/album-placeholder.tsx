"use client"

interface AlbumPlaceholderProps {
  title: string
  artist: string
  className?: string
}

export function AlbumPlaceholder({ title, artist, className = "" }: AlbumPlaceholderProps) {
  return (
    <div className={`bg-gray-100 flex flex-col items-center justify-center p-4 text-center ${className}`}>
      <div className="text-gray-400 mb-2">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>
      <div className="text-xs font-mono text-gray-600 space-y-1">
        <div className="font-medium truncate max-w-full">{title}</div>
        <div className="opacity-70 truncate max-w-full">{artist}</div>
      </div>
    </div>
  )
} 