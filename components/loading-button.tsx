"use client"

import { type ButtonHTMLAttributes, forwardRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  loadingText?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ className, children, isLoading, loadingText, variant, size, disabled, ...props }, ref) => {
    return (
      <Button
        className={cn(className)}
        variant={variant}
        size={size}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading && loadingText ? loadingText : children}
      </Button>
    )
  },
)
LoadingButton.displayName = "LoadingButton"

export { LoadingButton }
