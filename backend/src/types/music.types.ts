export interface Song {
  song_id: number;
  title: string;
  artist_name?: string;
  cover_url?: string | null;
  audio_url?: string;
  duration?: number;
  lyrics?: string | null;
  play_count?: number;
  created_at?: string;
  artist_id?: number;
  album_id?: number | null;
  genre_name?: string;
}

export interface GenreWithSongs {
  genre_id: number;
  genre_name: string;
  songs: {
    song_id: number;
    title: string;
    cover_url?: string | null;
    audio_url?: string;
    artist_name?: string;
  }[];
}

export interface Artist {
  artist_id: number;
  name: string;
  bio?: string | null;
  avatar_url?: string | null;
}

export interface Album {
  album_id: number;
  title: string;
  cover_url?: string | null;
  release_date?: string | null;
  artist_id: number;
  artist_name?: string;
}

export interface Genre {
  genre_id: number;
  name: string;
}

export interface SongDetailResponse {
  song: Song;
  relatedByArtist: Song[];
  relatedByGenre: Song[];
}
