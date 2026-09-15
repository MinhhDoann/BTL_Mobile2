import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

export interface SongData {
  song_id: number | string;
  title: string;
  artist_name: string;
  cover_url?: string;
  audio_url?: string;
  duration?: number;
  play_count?: number;
}

interface SongItemProps {
  song: SongData;
  onPress?: (song: SongData) => void;
  style?: ViewStyle;
  isCurrentPlaying?: boolean;
}

/**
  Component hiển thị bài hát trong thư viện theo đúng giao diện ảnh mẫu:
  - Bìa album vuông góc bo nhẹ (Image Cover)
  - Tiêu đề bài hát (Anh Là Ai - Chữ trắng đậm hoặc xanh lá khi đang phát)
  - Tên ca sĩ/nghệ sĩ (Phương Ly - Chữ xám nhạt #A7A7A7)
 */
export const SongItem: React.FC<SongItemProps> = ({
  song,
  onPress,
  style,
  isCurrentPlaying = false,
}) => {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.container, isCurrentPlaying && styles.activeContainer, style]}
      onPress={() => onPress && onPress(song)}
    >
      {/* 1. Ảnh bìa bài hát (Album Artwork) */}
      <View style={styles.imageWrapper}>
        <Image
          source={{
            uri:
              song.cover_url && song.cover_url.trim() !== ''
                ? song.cover_url
                : 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=300&q=80',
          }}
          style={styles.coverImage}
          resizeMode="cover"
        />
        {isCurrentPlaying && (
          <View style={styles.playingOverlay}>
            <Text style={styles.equalizerIcon}>♫</Text>
          </View>
        )}
      </View>

      {/* 2. Phần thông tin tên bài hát và nghệ sĩ */}
      <View style={styles.textContainer}>
        <Text
          style={[styles.songTitle, isCurrentPlaying && styles.playingTitle]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {song.title || 'Bài hát chưa có tên'}
        </Text>
        <Text style={styles.artistName} numberOfLines={1} ellipsizeMode="tail">
          {song.artist_name || 'Ca sĩ chưa xác định'}
        </Text>
      </View>

      {/* 3. Thời lượng bài hát (nếu có) */}
      {song.duration ? (
        <Text style={styles.durationText}>{formatDuration(song.duration)}</Text>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#121212', // Nền đen mờ chuẩn Spotify
    borderRadius: 8,
  },
  activeContainer: {
    backgroundColor: '#1E293B',
  },
  imageWrapper: {
    position: 'relative',
  },
  coverImage: {
    width: 52,
    height: 52,
    borderRadius: 6,
    backgroundColor: '#282828',
  },
  playingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equalizerIcon: {
    color: '#1DB954',
    fontSize: 20,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF', // Chữ trắng nổi bật như ảnh mẫu 1
    letterSpacing: 0.1,
  },
  playingTitle: {
    color: '#1DB954', // Màu xanh Spotify khi đang phát
  },
  artistName: {
    fontSize: 14,
    color: '#A7A7A7', // Màu xám nhạt Phương Ly
    marginTop: 4,
    fontWeight: '400',
  },
  durationText: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 8,
  },
});

export default SongItem;
