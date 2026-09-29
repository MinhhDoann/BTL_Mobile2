import { audioPlayer, PlayerState } from '@/src/lib/audio-player';
import { getCoverUrl } from '@/src/lib/cover-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function MiniPlayer() {
  const router = useRouter();
  const [playerState, setPlayerState] = useState<PlayerState>(audioPlayer.getState());

  useEffect(() => {
    const unsubscribe = audioPlayer.subscribe((state) => {
      setPlayerState(state);
    });
    return unsubscribe;
  }, []);

  if (!playerState.songId) {
    return null;
  }

  const { songId, isPlaying, positionMs, durationMs, title, artistName, coverUrl } = playerState;
  const progressPercent = durationMs > 0 ? Math.min(100, Math.max(0, (positionMs / durationMs) * 100)) : 0;

  const handleTogglePlay = async () => {
    await audioPlayer.togglePlay();
  };

  const handleStop = async () => {
    await audioPlayer.stopCurrent();
  };

  const handleOpenDetail = () => {
    router.navigate({ pathname: '/song-detail', params: { songId: String(songId) } });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.innerTouch}
        activeOpacity={0.9}
        onPress={handleOpenDetail}
      >
        <Image
          source={{ uri: getCoverUrl(coverUrl) }}
          style={styles.coverImage}
          resizeMode="cover"
        />

        <View style={styles.infoWrap}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {title || `Bài hát #${songId}`}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {artistName || 'Đang phát'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleTogglePlay}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={isPlaying ? 'pause' : 'play-arrow'}
            size={28}
            color="#38BDF8"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleStop}
          activeOpacity={0.7}
        >
          <MaterialIcons name="close" size={20} color="#94A3B8" />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Progress Bar Line */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  innerTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  coverImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#0F172A',
  },
  infoWrap: {
    flex: 1,
    marginLeft: 10,
    marginRight: 6,
  },
  songTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  artistName: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  actionButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginLeft: 4,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
  },
});
