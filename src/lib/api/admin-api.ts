import {
  AdminDashboardData,
  AdminEntity,
  AdminPage,
  AdminRecord,
  CreateSongInput,
  CreateSongRequest,
  DeletePreview,
} from '@/src/types/admin';

import { apiRequest as request } from './auth-api';

export function fetchAdminRows(entity: AdminEntity, page: number, query: string) {
  return request<AdminPage>(`/api/admin/data/${entity}?page=${page}&pageSize=20&q=${encodeURIComponent(query)}`);
}
export function fetchAdminRecord(entity: AdminEntity, id: number) {
  return request<AdminRecord>(`/api/admin/data/${entity}/${id}`);
}
export function saveAdminRecord(entity: AdminEntity, id: number | null, data: AdminRecord) {
  return request<{ message: string }>(`/api/admin/data/${entity}${id === null ? '' : `/${id}`}`, {
    method: id === null ? 'POST' : 'PUT', body: JSON.stringify(data),
  });
}
export function previewAdminDelete(entity: AdminEntity, id: number) {
  return request<DeletePreview>(`/api/admin/data/${entity}/${id}/delete-preview`);
}
export function deleteAdminRecord(entity: AdminEntity, id: number, confirmation: string) {
  return request<{ message: string }>(`/api/admin/data/${entity}/${id}`, {
    method: 'DELETE', body: JSON.stringify({ confirmation }),
  });
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
