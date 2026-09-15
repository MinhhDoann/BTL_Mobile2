import React from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { usePlayer } from '../../context/player-context';
import { IconSymbol } from './icon-symbol';

/**
 * Component Playing Tracker ở phía dưới màn hình (Player Bar) theo chuẩn giao diện Spotify
 * Trong ảnh 2:
 * - Góc trái: Bìa album, Tên bài "Rồi Ta Sẽ Ngắm Pháo Hoa Cùng Nhau", Ca sĩ "Olew", Nút Thích (+)
 * - Giữa: Bộ nút điều khiển (Trộn bài, Lùi bài, Nút Play/Pause tròn trắng, Qua bài, Lặp lại)
 *   Thanh tracking tiến trình nhạc với thời gian hiện tại (0:46) và thời lượng bài (4:38)
 * - Góc phải: Micro (Lời bài hát), Hàng chờ, Thiết bị kết nối, Âm lượng (Icon & Thanh trượt), Phóng to
 */
export const PlayingTracker: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLiked,
    togglePlayPause,
    seekTo,
    nextSong,
    prevSong,
    setVolume,
    toggleMute,
    toggleLike,
  } = usePlayer();

  if (!currentSong) return null;

  // Format thời gian 0:46, 4:38
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Tính phần trăm tiến trình (0 -> 100%)
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Bấm vào thanh tiến trình để Tua nhạc (Seek)
  const handleProgressClick = (e: any) => {
    if (Platform.OS === 'web' && e.nativeEvent) {
      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      const clickX = e.nativeEvent.clientX - rect.left;
      const width = rect.width;
      if (width > 0) {
        const newRatio = Math.max(0, Math.min(1, clickX / width));
        seekTo(Math.floor(newRatio * duration));
      }
    }
  };

  // Bấm vào thanh âm lượng để chỉnh Volume
  const handleVolumeClick = (e: any) => {
    if (Platform.OS === 'web' && e.nativeEvent) {
      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      const clickX = e.nativeEvent.clientX - rect.left;
      const width = rect.width;
      if (width > 0) {
        const newVol = Math.max(0, Math.min(1, clickX / width));
        setVolume(newVol);
      }
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* ================= 1. GÓC TRÁI: BÀI HÁT, CA SĨ & THÍCH ================= */}
        <View style={styles.leftSection}>
          <Image
            source={{
              uri:
                currentSong.cover_url ||
                'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80',
            }}
            style={styles.coverImage}
          />
          <View style={styles.songInfo}>
            <Text style={styles.songTitle} numberOfLines={1} ellipsizeMode="tail">
              {currentSong.title}
            </Text>
            <Text style={styles.artistName} numberOfLines={1} ellipsizeMode="tail">
              {currentSong.artist_name}
            </Text>
          </View>
          <TouchableOpacity onPress={toggleLike} style={styles.iconBtn} activeOpacity={0.7}>
            <Text style={[styles.heartIcon, isLiked && styles.heartActive]}>
              {isLiked ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= 2. GIỮA: NÚT ĐIỀU KHIỂN & PLAYING TRACKING ================= */}
        <View style={styles.centerSection}>
          {/* Hàng nút bấm điều khiển */}
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.controlBtnSmall}>
              <Text style={styles.controlIconText}>🔀</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlBtn} onPress={prevSong}>
              <Text style={styles.controlIconText}>⏮</Text>
            </TouchableOpacity>

            {/* Nút Play/Pause Tròn Trắng Chuẩn Spotify */}
            <TouchableOpacity
              style={styles.playPauseBtn}
              onPress={togglePlayPause}
              activeOpacity={0.85}
            >
              <Text style={styles.playPauseIcon}>{isPlaying ? '⏸' : '▶'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlBtn} onPress={nextSong}>
              <Text style={styles.controlIconText}>⏭</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlBtnSmall}>
              <Text style={styles.controlIconText}>🔁</Text>
            </TouchableOpacity>
          </View>

          {/* Thanh Playing Tracking (Tiến trình bài hát) */}
          <View style={styles.progressContainer}>
            <Text style={styles.timeLabel}>{formatTime(currentTime)}</Text>
            <Pressable
              style={styles.progressBarTrack}
              onPress={handleProgressClick}
            >
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              <View style={[styles.progressThumb, { left: `${progressPercent}%` }]} />
            </Pressable>
            <Text style={styles.timeLabel}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* ================= 3. GÓC PHẢI: MICRO, HÀNG CHỜ, ÂM LƯỢNG & PHÓNG TO ================= */}
        <View style={styles.rightSection}>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.rightIconText}>🎤</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.rightIconText}>≡</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.rightIconText}>💻</Text>
          </TouchableOpacity>

          {/* Thanh Âm Lượng */}
          <View style={styles.volumeContainer}>
            <TouchableOpacity onPress={toggleMute} style={{ marginRight: 6 }}>
              <Text style={styles.rightIconText}>{isMuted || volume === 0 ? '🔇' : '🔊'}</Text>
            </TouchableOpacity>
            <Pressable style={styles.volumeTrack} onPress={handleVolumeClick}>
              <View
                style={[
                  styles.volumeFill,
                  { width: `${isMuted ? 0 : volume * 100}%` },
                ]}
              />
            </Pressable>
          </View>

          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.rightIconText}>⤢</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#282828',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1600,
    alignSelf: 'center',
    width: '100%',
  },
  /* Left section */
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 180,
    maxWidth: 320,
  },
  coverImage: {
    width: 56,
    height: 56,
    borderRadius: 6,
    backgroundColor: '#282828',
  },
  songInfo: {
    marginLeft: 12,
    marginRight: 12,
    flex: 1,
  },
  songTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  artistName: {
    color: '#B3B3B3',
    fontSize: 12,
    marginTop: 2,
  },
  iconBtn: {
    padding: 6,
  },
  heartIcon: {
    color: '#B3B3B3',
    fontSize: 20,
  },
  heartActive: {
    color: '#1DB954',
  },

  /* Center section */
  centerSection: {
    flex: 2,
    maxWidth: 700,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 6,
  },
  controlBtnSmall: {
    opacity: 0.7,
    padding: 4,
  },
  controlBtn: {
    padding: 4,
  },
  controlIconText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  playPauseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseIcon: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 1,
  },

  /* Playing progress tracking bar */
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 8,
  },
  timeLabel: {
    color: '#A7A7A7',
    fontSize: 11,
    minWidth: 32,
    textAlign: 'center',
  },
  progressBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#4D4D4D',
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
    cursor: 'pointer' as any,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1DB954',
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    marginTop: -3,
    marginLeft: -5,
  },

  /* Right section */
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    minWidth: 160,
    maxWidth: 300,
    gap: 8,
  },
  rightIconText: {
    color: '#B3B3B3',
    fontSize: 14,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  volumeTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#4D4D4D',
    borderRadius: 2,
    overflow: 'hidden',
    cursor: 'pointer' as any,
  },
  volumeFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
});

export default PlayingTracker;
