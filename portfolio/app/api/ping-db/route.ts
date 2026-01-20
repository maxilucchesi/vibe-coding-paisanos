import { NextResponse } from "next/server"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

// This endpoint will be called by the Vercel cron job to keep the Supabase project active
export async function GET() {
  try {
    console.log("Ping database: Starting database ping")

    // Check if required environment variables are present
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ ok: false, reason: "missing_env" }, { status: 200 })
    }

    // Create Supabase client directly
    const supabase = createClientComponentClient<Database>({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })

    // Perform a simple query to keep the database active
    // We're just getting the count of books, which is a lightweight operation
    const { count, error } = await supabase.from("books").select("*", { count: "exact", head: true })

    if (error) {
      console.error("Ping database: Error pinging database:", error)
      return NextResponse.json(
        { success: false, message: "Failed to ping database", error: error.message },
        { status: 500 },
      )
    }

    console.log(`Ping database: Success! Found ${count} books.`)

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Database pinged successfully",
      timestamp: new Date().toISOString(),
      count,
    })
  } catch (error) {
    console.error("Ping database: Unexpected error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error", error: String(error) },
      { status: 500 },
    )
  }
}
