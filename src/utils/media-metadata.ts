import jsmediatags from 'jsmediatags';

export interface AudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  year?: string;
  genre?: string;
  coverUri?: string | null;
}

/**
 * Hàm trích xuất thông tin bài hát (thẻ ID3) từ đường dẫn fileUri (File Local hoặc URL)
 * @param fileUri Đường dẫn file (vd: file:///... hoặc http://...)
 * @returns Promise<AudioMetadata>
 */
export const getAudioMetadata = async (fileUri: string): Promise<AudioMetadata> => {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Chuyển đổi file URI thành dạng Blob thông qua fetch()
      const response = await fetch(fileUri);
      const blob = await response.blob();

      // 2. Sử dụng jsmediatags để phân tích thẻ ID3 từ Blob
      jsmediatags.read(blob, {
        onSuccess: (tag) => {
          const tags = tag.tags;
          let coverUri: string | null = null;

          // 3. Xử lý ảnh bìa (Artwork / Cover Picture)
          if (tags.picture) {
            const { data, format } = tags.picture;
            let base64String = '';
            for (let i = 0; i < data.length; i++) {
              base64String += String.fromCharCode(data[i]);
            }
            coverUri = `data:${format};base64,${btoa(base64String)}`;
          }

          resolve({
            title: tags.title || 'Không rõ tên bài hát',
            artist: tags.artist || 'Ca sĩ chưa xác định',
            album: tags.album || 'Chưa có album',
            year: tags.year ? String(tags.year) : undefined,
            genre: tags.genre || undefined,
            coverUri,
          });
        },
        onError: (error) => {
          console.error('Lỗi khi đọc ID3 Tags:', error);
          reject(error);
        },
      });
    } catch (error) {
      console.error('Lỗi khi fetch dữ liệu file từ URI:', error);
      reject(error);
    }
  });
};
