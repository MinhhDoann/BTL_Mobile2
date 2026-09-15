export type AdminStats = {
  users_count: number;
  artists_count: number;
  songs_count: number;
  playlists_count: number;
  total_plays: number;
};

export type ArtistOption = {
  artist_id: number;
  name: string;
  avatar_url?: string | null;
};

export type AlbumOption = {
  album_id: number;
  title: string;
  artist_id?: number | null;
  cover_url?: string | null;
  release_date?: string | null;
};

export type GenreOption = {
  genre_id: number;
  name: string;
};

export type RecentSong = {
  song_id: number;
  title: string;
  cover_url?: string | null;
  created_at?: string;
  artist_name?: string | null;
  genres?: string | null;
};

export type AdminDashboardData = {
  stats: AdminStats;
  artists: ArtistOption[];
  albums: AlbumOption[];
  genres: GenreOption[];
  recentSongs: RecentSong[];
};

export type CreateSongInput = {
  title: string;
  artist_id: string;
  album_id: string;
  duration: string;
  audio_url: string;
  cover_url: string;
  lyrics: string;
  genres: number[];
};

export type CreateSongRequest = {
  title: string;
  artist_id: number;
  album_id?: number | null;
  duration: number;
  audio_url: string;
  cover_url?: string | null;
  lyrics?: string | null;
  genres: number[];
};
