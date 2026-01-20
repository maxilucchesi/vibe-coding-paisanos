import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      albums: {
        Row: {
          id: string
          title: string
          artist: string
          artwork_url: string | null
          rating: number | null
          itunes_id: string | null
          musicbrainz_id: string | null
          release_year: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          artist: string
          artwork_url?: string | null
          rating?: number | null
          itunes_id?: string | null
          musicbrainz_id?: string | null
          release_year?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          artist?: string
          artwork_url?: string | null
          rating?: number | null
          itunes_id?: string | null
          musicbrainz_id?: string | null
          release_year?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 