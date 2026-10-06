export type AdminStats = {
  users_count: number;
  artists_count: number;
  songs_count: number;
  playlists_count: number;
  total_plays: number;
};

export type AdminEntity = 'users' | 'songs' | 'artists' | 'albums' | 'genres' | 'playlists' | 'payout_requests';
export type AdminRecord = Record<string, string | number | boolean | null | number[]>;
export type AdminPage = { items: AdminRecord[]; page: number; pageSize: number; total: number };
export type DeletePreview = { label: string; impacts: { label: string; count: number }[]; confirmation: string };

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

export type ComplaintItem = {
  complaint_id: number;
  reason_type: string;
  description: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  song_id: number;
  song_title: string;
  song_cover: string | null;
  song_duration: number;
  song_audio: string | null;
  artist_id: number;
  artist_name: string;
  artist_avatar: string | null;
  artist_bio: string | null;
  complainant_id: number;
  complainant_name: string;
  complainant_email: string;
};

export type RevenueSummary = {
  total_users: number;
  total_artists: number;
  total_songs: number;
  total_plays: number;
  total_banner_clicks: number;
  song_play_revenue: number;
  ad_banner_revenue: number;
  gross_system_revenue: number;
  platform_ad_share: number;
  artist_ad_share_gross: number;
  pit_tax_withheld: number;
  artist_ad_share_net: number;
  total_artist_net_earnings: number;
  platform_net_revenue: number;
};

export type PayoutSummary = {
  total_requests: number;
  approved_amount: number;
  pending_amount: number;
  rejected_amount: number;
};

export type ArtistRevenueStat = {
  artist_id: number;
  artist_name: string;
  avatar_url?: string | null;
  total_songs: number;
  total_plays: number;
  banner_clicks: number;
  song_revenue: number;
  ad_gross_revenue: number;
  artist_ad_share: number;
  pit_tax: number;
  artist_net: number;
  total_withdrawn: number;
  available_balance: number;
};

export type SongRevenueStat = {
  song_id: number;
  title: string;
  cover_url?: string | null;
  play_count: number;
  song_revenue: number;
  artist_name: string;
};

export type AdminRevenueReport = {
  summary: RevenueSummary;
  payout_summary: PayoutSummary;
  artist_breakdown: ArtistRevenueStat[];
  top_songs: SongRevenueStat[];
};


