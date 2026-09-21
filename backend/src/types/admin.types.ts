export type EntityName = 'users' | 'songs' | 'artists' | 'albums' | 'genres' | 'playlists';

export interface EntityConfig {
  id: string;
  label: string;
  fields: string[];
  search: string[];
  joins: string;
  extra: string;
}

export interface DeleteImpact {
  label: string;
  count: number;
}

export interface DeletionPreviewResult {
  label: any;
  impacts: DeleteImpact[];
  confirmation: string;
}

export interface AdminDashboardStats {
  users_count: number;
  artists_count: number;
  songs_count: number;
  playlists_count: number;
  total_plays: number;
}
