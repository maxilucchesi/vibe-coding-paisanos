"use client"

import { Grid3x3, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ViewModeToggleProps {
  viewMode: "list" | "gallery"
  onChange: (mode: "list" | "gallery") => void
  showLabels?: boolean
}

export function ViewModeToggle({ viewMode, onChange, showLabels = false }: ViewModeToggleProps) {
  return (
    <div className={`flex items-center ${showLabels ? "w-full justify-between" : ""} rounded-full bg-[#F5F5F5] p-1`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange("list")}
        className={`${
          viewMode === "list"
            ? "bg-white text-[#222222] shadow-sm"
            : "bg-transparent text-[#888888] hover:bg-gray-200 hover:text-[#222222]"
        } rounded-full px-3 py-1 h-8 ${showLabels ? "flex-1 justify-center" : ""}`}
      >
        {showLabels ? (
          <div className="flex items-center gap-2">
            <List className="h-4 w-4" />
            <span className="text-sm">Lista</span>
          </div>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <List className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Vista de lista</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange("gallery")}
        className={`${
          viewMode === "gallery"
            ? "bg-white text-[#222222] shadow-sm"
            : "bg-transparent text-[#888888] hover:bg-gray-200 hover:text-[#222222]"
        } rounded-full px-3 py-1 h-8 ${showLabels ? "flex-1 justify-center" : ""}`}
      >
        {showLabels ? (
          <div className="flex items-center gap-2">
            <Grid3x3 className="h-4 w-4" />
            <span className="text-sm">Galería</span>
          </div>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Grid3x3 className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Vista de galería</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </Button>
    </div>
  )
}
