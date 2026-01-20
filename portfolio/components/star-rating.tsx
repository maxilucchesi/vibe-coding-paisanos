"use client"

import { Star } from "lucide-react"

interface StarRatingProps {
  rating: number
  setRating: (rating: number) => void
}

export function StarRating({ rating, setRating }: StarRatingProps) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => setRating(star)} className="p-1 focus:outline-none">
          <Star
            className={`h-6 w-6 ${
              star <= rating ? "fill-[#FFA69E] text-[#FFA69E]" : "text-[#CCCCCC]"
            } transition-colors duration-200`}
          />
        </button>
      ))}
    </div>
  )
}
