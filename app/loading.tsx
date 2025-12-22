import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FDFCFB]">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-[#FFA69E]" />
        <p className="text-lg text-[#888888]">Cargando...</p>
      </div>
    </div>
  )
}
