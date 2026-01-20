"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ArrowDown } from "lucide-react"

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullProgress, setPullProgress] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef(0)
  const pullThreshold = 80 // Pixels needed to pull to trigger refresh

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let touchStartY = 0
    let touchMoveY = 0

    const handleTouchStart = (e: TouchEvent) => {
      // Only enable pull to refresh when at the top of the page
      if (window.scrollY <= 0) {
        touchStartY = e.touches[0].clientY
        startYRef.current = touchStartY
        setIsPulling(true)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return

      touchMoveY = e.touches[0].clientY
      const pullDistance = Math.max(0, touchMoveY - startYRef.current)

      // Calculate progress (0-100%)
      const progress = Math.min(100, (pullDistance / pullThreshold) * 100)
      setPullProgress(progress)

      // Prevent default scrolling if we're pulling
      if (pullDistance > 10 && window.scrollY <= 0) {
        e.preventDefault()
      }
    }

    const handleTouchEnd = async () => {
      if (!isPulling) return

      const pullDistance = Math.max(0, touchMoveY - startYRef.current)

      if (pullDistance >= pullThreshold) {
        // Trigger haptic feedback if supported
        if ("vibrate" in navigator) {
          try {
            navigator.vibrate(50) // Short 50ms vibration
          } catch (e) {
            console.log("Vibration not supported")
          }
        }

        // For iOS Safari which doesn't support the Vibration API
        // We can try to use the experimental impact feedback if available
        try {
          if (window.navigator && (window.navigator as any).haptics && (window.navigator as any).haptics.impact) {
            ;(window.navigator as any).haptics.impact({ style: "medium" })
          }
        } catch (e) {
          // Silently fail if not supported
        }

        // Trigger refresh
        setIsRefreshing(true)
        try {
          await onRefresh()
        } catch (error) {
          console.error("Error refreshing:", error)
        } finally {
          setIsRefreshing(false)
        }
      }

      // Reset states
      setIsPulling(false)
      setPullProgress(0)
    }

    container.addEventListener("touchstart", handleTouchStart, { passive: false })
    container.addEventListener("touchmove", handleTouchMove, { passive: false })
    container.addEventListener("touchend", handleTouchEnd)

    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isPulling, onRefresh])

  return (
    <div ref={containerRef} className="relative min-h-full">
      {/* Pull indicator */}
      <div
        className={`absolute left-0 right-0 flex justify-center transition-transform duration-200 z-10 ${
          isPulling || isRefreshing ? "opacity-100" : "opacity-0"
        }`}
        style={{
          transform: `translateY(${isPulling ? pullProgress / 2 : 0}px)`,
          top: "-40px",
        }}
      >
        <div className="bg-white rounded-full p-2 shadow-md">
          {isRefreshing ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#FFA69E] border-t-transparent" />
          ) : (
            <ArrowDown
              className={`h-6 w-6 text-[#FFA69E] transition-transform duration-300 ${
                pullProgress > 80 ? "rotate-180" : ""
              }`}
            />
          )}
        </div>
      </div>

      {/* Main content */}
      {children}
    </div>
  )
}
