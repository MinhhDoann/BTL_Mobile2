export interface FallbackSong {
  song_id: number;
  title: string;
  artist_name: string;
  cover_url: string;
  audio_url: string;
}

export interface FallbackGenreWithSongs {
  genre_id: number;
  genre_name: string;
  songs: FallbackSong[];
}

export const FALLBACK_HOME_DATA: FallbackGenreWithSongs[] = [
  {
    genre_id: 1,
    genre_name: 'Pop',
    songs: [
      {
        song_id: 1,
        title: 'Vợ Người Ta',
        artist_name: 'Phan Mạnh Quỳnh',
        cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
        audio_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
      },
      {
        song_id: 2,
        title: 'Chúng Ta Của Hiện Tại',
        artist_name: 'Sơn Tùng M-TP',
        cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500',
        audio_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
      },
    ],
  },
  {
    genre_id: 2,
    genre_name: 'Ballad',
    songs: [
      {
        song_id: 3,
        title: 'Người Đầu Tiên',
        artist_name: 'J97',
        cover_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500',
        audio_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
      },
      {
        song_id: 4,
        title: 'Nơi Này Có Anh',
        artist_name: 'Sơn Tùng M-TP',
        cover_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500',
        audio_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
      },
    ],
  },
  {
    genre_id: 3,
    genre_name: 'Indie / Acoustic',
    songs: [
      {
        song_id: 5,
        title: 'Người Gieo Mầm Xanh',
        artist_name: 'Hoàng Dũng',
        cover_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500',
        audio_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
      },
    ],
  },
];
