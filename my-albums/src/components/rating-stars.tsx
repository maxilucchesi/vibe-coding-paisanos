"use client"

interface RatingStarsProps {
  rating: number
  size?: "sm" | "md" | "lg" | "xl"
  onChange?: (rating: number) => void
  interactive?: boolean
}

export function RatingStars({ rating, size = "md", onChange, interactive = false }: RatingStarsProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-2xl",
  }

  const handleClick = (newRating: number) => {
    if (interactive && onChange) {
      onChange(newRating)
    }
  }

  return (
    <div className={`flex gap-0.5 ${sizeClasses[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`${interactive ? "cursor-pointer hover:opacity-70" : ""} transition-opacity`}
          onClick={() => handleClick(star)}
        >
          {star <= rating ? "★" : "☆"}
        </span>
      ))}
    </div>
  )
}
