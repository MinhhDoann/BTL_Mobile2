import { AdminEntity } from '@/src/types/admin';

export type AdminField = {
  key: string; label: string;
  type?: 'text' | 'number' | 'textarea' | 'date' | 'password' | 'checkbox' | 'select' | 'genres';
  required?: boolean; max?: number;
  options?: 'artists' | 'albums' | 'roles';
};
type EntityConfig = {
  title: string; id: string;
  columns: { key: string; label: string }[];
  fields: AdminField[];
};
export const ADMIN_ENTITIES: Record<AdminEntity, EntityConfig> = {
  users: {
    title: 'Người dùng', id: 'user_id',
    columns: [{ key: 'user_id', label: 'ID' }, { key: 'username', label: 'Tên người dùng' }, { key: 'email', label: 'Email' }, { key: 'role', label: 'Role' }, { key: 'is_premium', label: 'Premium' }],
    fields: [
      { key: 'username', label: 'Tên người dùng', required: true, max: 50 },
      { key: 'email', label: 'Email', required: true, max: 100 },
      { key: 'password', label: 'Mật khẩu (để trống khi sửa nếu giữ nguyên)', type: 'password', max: 255 },
      { key: 'avatar_url', label: 'Avatar URL', max: 255 },
      { key: 'role', label: 'Role', type: 'select', options: 'roles', required: true },
      { key: 'is_premium', label: 'Tài khoản Premium', type: 'checkbox' },
    ],
  },
  songs: {
    title: 'Bài hát', id: 'song_id',
    columns: [{ key: 'song_id', label: 'ID' }, { key: 'title', label: 'Tên bài hát' }, { key: 'artist_name', label: 'Nghệ sĩ' }, { key: 'album_title', label: 'Album' }, { key: 'duration', label: 'Giây' }, { key: 'play_count', label: 'Lượt nghe' }],
    fields: [
      { key: 'title', label: 'Tên bài hát', required: true, max: 150 },
      { key: 'artist_id', label: 'Nghệ sĩ', type: 'select', options: 'artists', required: true },
      { key: 'album_id', label: 'Album', type: 'select', options: 'albums' },
      { key: 'duration', label: 'Thời lượng (giây)', type: 'number', required: true },
      { key: 'audio_url', label: 'Audio URL', required: true, max: 255 },
      { key: 'cover_url', label: 'Cover URL', max: 255 },
      { key: 'lyrics', label: 'Lời bài hát', type: 'textarea', max: 16000 },
      { key: 'genres', label: 'Thể loại', type: 'genres' },
    ],
  },
  artists: {
    title: 'Nghệ sĩ', id: 'artist_id',
    columns: [{ key: 'artist_id', label: 'ID' }, { key: 'name', label: 'Tên nghệ sĩ' }, { key: 'bio', label: 'Tiểu sử' }],
    fields: [{ key: 'name', label: 'Tên nghệ sĩ', required: true, max: 100 }, { key: 'bio', label: 'Tiểu sử', type: 'textarea', max: 16000 }, { key: 'avatar_url', label: 'Avatar URL', max: 255 }],
  },
  albums: {
    title: 'Album', id: 'album_id',
    columns: [{ key: 'album_id', label: 'ID' }, { key: 'title', label: 'Tên album' }, { key: 'artist_name', label: 'Nghệ sĩ' }, { key: 'release_date', label: 'Ngày phát hành' }],
    fields: [{ key: 'title', label: 'Tên album', required: true, max: 100 }, { key: 'artist_id', label: 'Nghệ sĩ', type: 'select', options: 'artists' }, { key: 'cover_url', label: 'Cover URL', max: 255 }, { key: 'release_date', label: 'Ngày phát hành', type: 'date' }],
  },
  genres: {
    title: 'Thể loại', id: 'genre_id',
    columns: [{ key: 'genre_id', label: 'ID' }, { key: 'name', label: 'Tên thể loại' }],
    fields: [{ key: 'name', label: 'Tên thể loại', required: true, max: 50 }],
  },
  playlists: {
    title: 'Playlist', id: 'playlist_id',
    columns: [{ key: 'playlist_id', label: 'ID' }, { key: 'title', label: 'Tên playlist' }, { key: 'owner_name', label: 'Người sở hữu' }, { key: 'song_count', label: 'Số bài hát' }, { key: 'is_public', label: 'Công khai' }],
    fields: [{ key: 'title', label: 'Tên playlist', required: true, max: 100 }, { key: 'user_id', label: 'ID người sở hữu (xem trong bảng Người dùng)', type: 'number', required: true }, { key: 'description', label: 'Mô tả', type: 'textarea', max: 16000 }, { key: 'cover_url', label: 'Cover URL', max: 255 }, { key: 'is_public', label: 'Công khai', type: 'checkbox' }],
  },
};
