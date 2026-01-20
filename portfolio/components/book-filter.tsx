"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

interface BookFilterProps {
  currentFilter: string
}

export function BookFilter({ currentFilter }: BookFilterProps) {
  const router = useRouter()
  const pathname = usePathname()

  const setFilter = (filter: string) => {
    router.push(`${pathname}?filter=${filter}`)
  }

  return (
    <div className="mb-6 flex space-x-2 rounded-full bg-[#F5F5F5] p-1">
      <Button
        variant="ghost"
        className={`flex-1 rounded-full py-2 text-sm ${
          currentFilter === "read" ? "bg-[#D0E2FF] text-[#222222]" : "text-[#888888] hover:text-[#222222]"
        } transition-all duration-200`}
        onClick={() => setFilter("read")}
      >
        Leídos
      </Button>
      <Button
        variant="ghost"
        className={`flex-1 rounded-full py-2 text-sm ${
          currentFilter === "wishlist" ? "bg-[#D0E2FF] text-[#222222]" : "text-[#888888] hover:text-[#222222]"
        } transition-all duration-200`}
        onClick={() => setFilter("wishlist")}
      >
        Wishlist
      </Button>
    </div>
  )
}
