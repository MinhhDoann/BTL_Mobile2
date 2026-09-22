import { apiRequest } from './auth-api';
import { detectApiBase } from './detectApi';

export interface ArtistProfile {
  artist_id: number;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  user_id?: number;
  created_at?: string;
}

export interface ArtistSong {
  song_id: number;
  title: string;
  duration: number;
  audio_url: string;
  cover_url: string | null;
  lyrics: string | null;
  play_count: number;
  revenue: number;
  genres?: string;
  created_at?: string;
}

export interface SongBreakdown {
  song_id: number;
  title: string;
  cover_url: string | null;
  play_count: number;
  song_revenue: number;
  created_date?: string;
}

export interface ArtistRevenueData {
  artist: {
    artist_id: number;
    name: string;
    avatar_url: string | null;
  };
  rate_per_play: number;
  currency: string;
  total_songs: number;
  total_plays: number;
  total_revenue: number;
  withdrawable_balance: number;
  song_breakdown: SongBreakdown[];
}

export interface CreateSongData {
  title: string;
  duration: number;
  audio_url: string;
  cover_url?: string;
  lyrics?: string;
  genres?: number[];
  album_id?: number;
}

export interface GenreItem {
  genre_id: number;
  name: string;
}

// 1. Lấy thông tin hồ sơ Nghệ sĩ
export async function getArtistProfile(): Promise<{ artist: ArtistProfile }> {
  return apiRequest<{ artist: ArtistProfile }>('/api/artist/profile');
}

// 2. Cập nhật hồ sơ Nghệ sĩ
export async function updateArtistProfile(data: { name: string; bio?: string; avatar_url?: string }): Promise<{ message: string; artist: ArtistProfile }> {
  return apiRequest<{ message: string; artist: ArtistProfile }>('/api/artist/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// 3. Lấy danh sách bài hát của Nghệ sĩ kèm doanh thu
export async function getArtistSongs(): Promise<{ artist: ArtistProfile; songs: ArtistSong[]; total: number }> {
  return apiRequest<{ artist: ArtistProfile; songs: ArtistSong[]; total: number }>('/api/artist/songs');
}

// 4. Nghệ sĩ đăng tải bài hát mới
export async function createArtistSong(data: CreateSongData): Promise<{ ok: boolean; message: string; songId: number }> {
  return apiRequest<{ ok: boolean; message: string; songId: number }>('/api/artist/songs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 5. Nghệ sĩ xóa bài hát của mình
export async function deleteArtistSong(songId: number): Promise<{ ok: boolean; message: string }> {
  return apiRequest<{ ok: boolean; message: string }>(`/api/artist/songs/${songId}`, {
    method: 'DELETE',
  });
}

// 6. Lấy báo cáo Doanh thu tính theo lượt view/stream
export async function getArtistRevenue(): Promise<ArtistRevenueData> {
  return apiRequest<ArtistRevenueData>('/api/artist/revenue');
}

// 7. Yêu cầu rút tiền / thanh toán
export async function requestPayout(data: {
  amount: number;
  bank_name: string;
  account_number: string;
  account_holder: string;
}): Promise<{ ok: boolean; message: string }> {
  return apiRequest<{ ok: boolean; message: string }>('/api/artist/payout-request', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 8. Đăng ký nâng cấp tài khoản lên Nghệ sĩ
export async function upgradeToArtist(): Promise<{ message: string; user: any; artist: ArtistProfile }> {
  return apiRequest<{ message: string; user: any; artist: ArtistProfile }>('/api/artist/register', {
    method: 'POST',
  });
}

// 9. Ghi nhận 1 lượt nghe cho bài hát
export async function recordSongPlay(songId: number, userId?: number | null): Promise<void> {
  try {
    const base = process.env.EXPO_PUBLIC_API_URL || await detectApiBase();
    await fetch(`${base.replace(/\/$/, '')}/api/songs/${songId}/listen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
  } catch {
    // Không làm gián đoạn trải nghiệm nghe nhạc nếu ghi nhận thất bại
  }
}
