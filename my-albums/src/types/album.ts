export interface Album {
  id: string
  title: string
  artist: string
  artwork_url: string | null
  rating: number // 0-5
  itunes_id?: string
  musicbrainz_id?: string
  release_year?: string | null
  user_id: string
  created_at: string
  updated_at: string
}
