import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAudioPlayer } from '@/src/hooks/use-audio-player';
import { audioPlayer } from '@/src/lib/audio-player';
import { getCoverUrl } from '@/src/lib/cover-image';

export function MiniPlayer() {
  const router = useRouter();
  const pathname = usePathname();
  const playerState = useAudioPlayer();

  if (!playerState.songId || pathname === '/song-detail') return null;

  const handleTogglePlay = async () => {
    await audioPlayer.togglePlay();
  };

  const handleClose = async () => {
    await audioPlayer.stopCurrent();
  };

  const handlePress = () => {
    router.push({ pathname: '/song-detail', params: { songId: String(playerState.songId) } });
  };

  const formatTime = (ms: number) => {
    if (!Number.isFinite(ms) || ms <= 0) return '0:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  const progressPercent = playerState.durationMs
    ? (playerState.positionMs / playerState.durationMs) * 100
    : 0;

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.9} onPress={handlePress}>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
      </View>
      <View style={styles.content}>
        <Image
          source={{ uri: getCoverUrl(playerState.coverUrl || '') }}
          style={styles.cover}
        />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {playerState.title || 'Unknown Title'}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {playerState.artist || 'Unknown Artist'}
          </Text>
        </View>
        <TouchableOpacity style={styles.playButton} onPress={handleTogglePlay}>
          <Text style={styles.playIcon}>{playerState.isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 72, // Adjust based on your tab bar / footer height
    left: 8,
    right: 8,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  progressContainer: {
    height: 3,
    backgroundColor: '#334155',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8B5CF6',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  cover: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#0F172A',
  },
  info: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  playButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: '#E2E8F0',
    fontSize: 20,
  },
  closeButton: {
    width: 36,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  closeIcon: {
    color: '#94A3B8',
    fontSize: 18,
  },
});
