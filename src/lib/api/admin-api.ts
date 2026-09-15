import {
    AdminDashboardData,
    CreateSongInput,
    CreateSongRequest,
} from '@/src/types/admin';
import { Platform } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? (Platform.OS === 'web' ? 'http://localhost:3000' : 'http://10.88.114.200:3000');

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(payload?.message ?? payload?.error ?? 'Yêu cầu thất bại');
  }

  return payload as T;
}

export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  return request<AdminDashboardData>('/api/admin/dashboard');
}

export function normalizeSongPayload(form: CreateSongInput): CreateSongRequest {
  return {
    title: form.title.trim(),
    artist_id: Number(form.artist_id),
    album_id: form.album_id ? Number(form.album_id) : null,
    duration: Number(form.duration),
    audio_url: form.audio_url.trim(),
    cover_url: form.cover_url.trim() || null,
    lyrics: form.lyrics.trim() || null,
    genres: form.genres,
  };
}

export async function createSong(form: CreateSongInput) {
  const payload = normalizeSongPayload(form);

  return request<{ message: string; song: any }>('/api/admin/songs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createArtist(payload: { name: string; bio?: string; avatar_url?: string }) {
  return request<{ message: string; artist: any }>('/api/admin/artists', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createAlbum(payload: { title: string; artist_id: number; cover_url?: string; release_date?: string }) {
  return request<{ message: string; album: any }>('/api/admin/albums', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createGenre(payload: { name: string }) {
  return request<{ message: string; genre: any }>('/api/admin/genres', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
