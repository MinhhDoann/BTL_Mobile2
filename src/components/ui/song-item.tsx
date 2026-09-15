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
}

interface SongItemProps {
  song: SongData;
  onPress?: (song: SongData) => void;
  style?: ViewStyle;
  isCurrentPlaying?: boolean;
}

/**
 * Component hiển thị thông tin bài hát chuẩn giao diện Spotify
 * - Tên bài hát: Màu xanh ngọc (Spotify Green #1DB954)
 * - Tên nghệ sĩ: Màu xám nhạt (#A7A7A7)
 * - Bấm vào row để phát nhạc hoặc xử lý sự kiện
 */
export const SongItem: React.FC<SongItemProps> = ({
  song,
  onPress,
  style,
  isCurrentPlaying = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.container, style]}
      onPress={() => onPress && onPress(song)}
    >
      {/* 1. Ảnh bìa bài hát (Cover Artwork) */}
      <Image
        source={{
          uri:
            song.cover_url && song.cover_url.trim() !== ''
              ? song.cover_url
              : 'https://via.placeholder.com/150/1E293B/FFFFFF?text=Music',
        }}
        style={styles.coverImage}
        resizeMode="cover"
      />

      {/* 2. Phần thông tin bài hát & ca sĩ */}
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#121212', // Màu nền tối chuẩn Spotify
    borderRadius: 8,
  },
  coverImage: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: '#282828',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  songTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1DB954', // Màu xanh Spotify nổi bật giống trong hình
    letterSpacing: 0.2,
  },
  playingTitle: {
    color: '#1DB954',
    fontWeight: '700',
  },
  artistName: {
    fontSize: 13,
    color: '#A7A7A7', // Màu xám nhạt cho tên nghệ sĩ
    marginTop: 3,
  },
});

export default SongItem;
