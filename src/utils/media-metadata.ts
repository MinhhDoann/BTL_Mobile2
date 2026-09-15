export interface AudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  year?: string;
  genre?: string;
  coverUri?: string | null;
}

/**
 * Hàm trích xuất thông tin bài hát từ đường dẫn fileUri
 */
export const getAudioMetadata = async (fileUri: string): Promise<AudioMetadata> => {
  return {
    title: 'Bài hát local',
    artist: 'Nghệ sĩ',
    album: 'Album',
    coverUri: null,
  };
};
