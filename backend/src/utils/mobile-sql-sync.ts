import fs from 'fs';
import path from 'path';

/**
 * Tự động ghi câu lệnh INSERT INTO songs vào file mobile.sql của dự án
 */
export function appendSongToMobileSql(song: {
  title: string;
  duration: number;
  audio_url: string;
  cover_url?: string | null;
  lyrics?: string | null;
  artist_id: number;
  album_id?: number | null;
}): boolean {
  try {
    const mobileSqlPath = path.resolve(__dirname, '../../../mobile.sql');

    if (!fs.existsSync(mobileSqlPath)) {
      console.warn('Không tìm thấy file mobile.sql tại:', mobileSqlPath);
      return false;
    }

    const escapeSqlStr = (val?: string | null) => {
      if (!val || val === 'NULL') return 'NULL';
      return `'${val.replace(/'/g, "''")}'`;
    };

    const titleStr = escapeSqlStr(song.title);
    const audioUrlStr = escapeSqlStr(song.audio_url);
    const coverUrlStr = escapeSqlStr(song.cover_url);
    const artistId = song.artist_id;
    const albumId = song.album_id ? song.album_id : 'NULL';
    const duration = song.duration || 180;

    const sqlStatement = `\nINSERT INTO songs (title, duration, audio_url, cover_url, play_count, artist_id, album_id) VALUES (${titleStr}, ${duration}, ${audioUrlStr}, ${coverUrlStr}, 0, ${artistId}, ${albumId});\n`;

    fs.appendFileSync(mobileSqlPath, sqlStatement, 'utf8');
    console.log(`[SQL Sync] Đã tự động chèn bài hát "${song.title}" vào file mobile.sql`);
    return true;
  } catch (err) {
    console.error('Lỗi khi ghi bài hát vào mobile.sql:', err);
    return false;
  }
}
