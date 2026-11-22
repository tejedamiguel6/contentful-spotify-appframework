export interface SpotifyImage {
  url: string;
  width?: number;
  height?: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres?: string[];
  images?: SpotifyImage[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists?: SpotifyArtist[];
  album?: {
    name?: string;
    images?: SpotifyImage[];
  };
}

// The spotify-data endpoint returns either tracks or artists depending on
// the entry's itemType, so list items can carry fields from both shapes.
export type TopItem = SpotifyArtist & Partial<SpotifyTrack>;

export interface TopItemsResponse {
  items: TopItem[];
}

export interface ArtistSearchResponse {
  artists?: {
    items: SpotifyArtist[];
  };
}

/** GET /api/contentful/artist-stats?name=… (listening history from the DB) */
export interface ArtistStats {
  artist: string;
  totalPlays: number;
  uniqueTracks: number;
  uniqueAlbums: number;
  firstPlay: string | null;
  lastPlay: string | null;
  topTracks: {
    track: string;
    album: string;
    coverUrl: string | null;
    plays: number;
  }[];
}
