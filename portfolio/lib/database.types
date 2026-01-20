export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          id: string
          created_at: string
          title: string
          author: string
          type: "read" | "wishlist"
          rating: number | null
          date_finished: string | null
          review: string | null
          user_id: string
          local_id?: string | null
          // Nuevos campos de metadata
          published_date?: string | null
          description?: string | null
          categories?: string[] | null
          thumbnail?: string | null
          page_count?: number | null
          publisher?: string | null
          isbn?: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          author: string
          type: "read" | "wishlist"
          rating?: number | null
          date_finished?: string | null
          review?: string | null
          user_id: string
          local_id?: string | null
          // Nuevos campos de metadata
          published_date?: string | null
          description?: string | null
          categories?: string[] | null
          thumbnail?: string | null
          page_count?: number | null
          publisher?: string | null
          isbn?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          author?: string
          type?: "read" | "wishlist"
          rating?: number | null
          date_finished?: string | null
          review?: string | null
          user_id?: string
          local_id?: string | null
          // Nuevos campos de metadata
          published_date?: string | null
          description?: string | null
          categories?: string[] | null
          thumbnail?: string | null
          page_count?: number | null
          publisher?: string | null
          isbn?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
