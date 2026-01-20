import { getBookById } from "@/lib/books"
import { EditBookForm } from "@/components/edit-book-form"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function EditBookPage({ params }: { params: { id: string } }) {
  const book = await getBookById(params.id)

  if (!book) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] p-6">
      <div className="mx-auto max-w-md">
        <EditBookForm book={book} />
      </div>
    </div>
  )
}
