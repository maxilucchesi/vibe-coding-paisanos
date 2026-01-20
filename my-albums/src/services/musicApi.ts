interface iTunesAlbum {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl100: string;
  artworkUrl600?: string;
  releaseDate: string;
  primaryGenreName: string;
}

interface iTunesResponse {
  resultCount: number;
  results: iTunesAlbum[];
}

interface MusicBrainzRelease {
  id: string;
  title: string;
  'artist-credit': Array<{
    name: string;
    artist: {
      name: string;
    };
  }>;
  date?: string;
}

interface MusicBrainzResponse {
  releases: MusicBrainzRelease[];
}

export interface AlbumSearchResult {
  id: string;
  title: string;
  artist: string;
  artwork_url: string;
  source: 'itunes' | 'musicbrainz';
  external_id?: string;
  release_year?: string;
}

class MusicApiService {
  private readonly ITUNES_BASE_URL = 'https://itunes.apple.com/search';
  private readonly MUSICBRAINZ_BASE_URL = 'https://musicbrainz.org/ws/2';
  private readonly COVER_ART_BASE_URL = 'https://coverartarchive.org/release';

  async searchAlbums(query: string): Promise<AlbumSearchResult[]> {
    try {
      // Try iTunes first
      const itunesResults = await this.searchItunes(query);
      if (itunesResults.length > 0) {
        return itunesResults;
      }

      // Fallback to MusicBrainz
      const musicBrainzResults = await this.searchMusicBrainz(query);
      return musicBrainzResults;
    } catch (error) {
      console.error('Error searching albums:', error);
      return [];
    }
  }

  private async searchItunes(query: string): Promise<AlbumSearchResult[]> {
    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(
        `${this.ITUNES_BASE_URL}?term=${encodedQuery}&entity=album&limit=10`
      );

      if (!response.ok) {
        throw new Error(`iTunes API error: ${response.status}`);
      }

      const data: iTunesResponse = await response.json();
      
      return data.results.map(album => ({
        id: album.collectionId.toString(),
        title: album.collectionName,
        artist: album.artistName,
        artwork_url: album.artworkUrl600 || album.artworkUrl100.replace('100x100', '600x600'),
        source: 'itunes' as const,
        external_id: album.collectionId.toString(),
        release_year: album.releaseDate ? new Date(album.releaseDate).getFullYear().toString() : undefined
      }));
    } catch (error) {
      console.error('iTunes search error:', error);
      return [];
    }
  }

  private async searchMusicBrainz(query: string): Promise<AlbumSearchResult[]> {
    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(
        `${this.MUSICBRAINZ_BASE_URL}/release/?query=${encodedQuery}&fmt=json&limit=10`
      );

      if (!response.ok) {
        throw new Error(`MusicBrainz API error: ${response.status}`);
      }

      const data: MusicBrainzResponse = await response.json();
      
      const results: AlbumSearchResult[] = [];
      
      for (const release of data.releases) {
        const artworkUrl = await this.getCoverArt(release.id);
        
        results.push({
          id: release.id,
          title: release.title,
          artist: release['artist-credit']?.[0]?.name || release['artist-credit']?.[0]?.artist?.name || 'Unknown Artist',
          artwork_url: artworkUrl,
          source: 'musicbrainz' as const,
          external_id: release.id,
          release_year: release.date ? release.date.substring(0, 4) : undefined
        });
      }

      return results;
    } catch (error) {
      console.error('MusicBrainz search error:', error);
      return [];
    }
  }

  private async getCoverArt(releaseId: string): Promise<string> {
    try {
      const response = await fetch(`${this.COVER_ART_BASE_URL}/${releaseId}/front-500.jpg`);
      
      if (response.ok) {
        return response.url;
      }
      
      // Fallback to placeholder
      return this.getPlaceholderImage();
    } catch (error) {
      console.error('Cover art fetch error:', error);
      return this.getPlaceholderImage();
    }
  }

  private getPlaceholderImage(): string {
    return '/placeholder.svg';
  }

  // Utility method to get high-res artwork URL for iTunes
  getHighResArtwork(url: string): string {
    return url.replace('100x100', '600x600');
  }
}

export const musicApi = new MusicApiService(); 