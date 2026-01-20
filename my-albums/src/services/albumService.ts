import { supabase } from '@/lib/supabase'
import type { Album } from '@/types/album'

export class AlbumService {
  // Get all albums
  async getAlbums(): Promise<Album[]> {
    try {
      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching albums:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in getAlbums:', error)
      return []
    }
  }

  // Add a new album
  async addAlbum(albumData: Omit<Album, 'id' | 'created_at' | 'updated_at'>, userId: string): Promise<Album | null> {
    try {
      console.log('Adding album to Supabase:', albumData)
      const { data, error } = await supabase
        .from('albums')
        .insert({
          title: albumData.title,
          artist: albumData.artist,
          artwork_url: albumData.artwork_url,
          rating: albumData.rating,
          itunes_id: albumData.itunes_id,
          musicbrainz_id: albumData.musicbrainz_id,
          release_year: albumData.release_year,
          user_id: userId
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding album:', error)
        throw error
      }

      console.log('Album saved to Supabase:', data)
      return data
    } catch (error) {
      console.error('Error in addAlbum:', error)
      return null
    }
  }

  // Update an existing album
  async updateAlbum(id: string, albumData: Partial<Album>): Promise<Album | null> {
    try {
      const { data, error } = await supabase
        .from('albums')
        .update({
          title: albumData.title,
          artist: albumData.artist,
          artwork_url: albumData.artwork_url,
          rating: albumData.rating,
          itunes_id: albumData.itunes_id,
          musicbrainz_id: albumData.musicbrainz_id,
          release_year: albumData.release_year,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating album:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in updateAlbum:', error)
      return null
    }
  }

  // Delete an album
  async deleteAlbum(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('albums')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting album:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('Error in deleteAlbum:', error)
      return false
    }
  }

  // Get album by ID
  async getAlbumById(id: string): Promise<Album | null> {
    try {
      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching album by ID:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in getAlbumById:', error)
      return null
    }
  }

  // Search albums by title or artist
  async searchAlbums(query: string): Promise<Album[]> {
    try {
      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .or(`title.ilike.%${query}%,artist.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error searching albums:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in searchAlbums:', error)
      return []
    }
  }
}

export const albumService = new AlbumService() 