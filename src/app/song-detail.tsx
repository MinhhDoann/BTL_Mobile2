import { AppHeader } from '@/src/components/ui/app-header';
import { Footer } from '@/src/components/ui/footer';
import { useFooterActions } from '@/src/constants/footer-actions';
import { audioPlayer } from '@/src/lib/audio-player';
import { getCoverUrl } from '@/src/lib/cover-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SongDetailItem = {
  song_id: number;
  title: string;
  duration: number;
  audio_url: string;
  cover_url: string;
  lyrics: string | null;
  play_count: number;
  artist_id: number;
  artist_name: string;
  artist_avatar: string | null;
  genre_name: string;
};

type RelatedSong = {
  song_id: number;
  title: string;
  cover_url: string | null;
  audio_url: string;
  artist_name: string;
};

import { detectApiBase } from '@/src/lib/api/detectApi';

export default function SongDetailScreen() {
  const router = useRouter();
  const { songId } = useLocalSearchParams<{ songId: string }>();
  const footerActions = useFooterActions('home');

  const [detail, setDetail] = useState<{
    song: SongDetailItem;
    relatedByArtist: RelatedSong[];
    relatedByGenre: RelatedSong[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [currentSongId, setCurrentSongId] = useState<number | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!songId) return;

      try {
        const base = await detectApiBase();
        const response = await fetch(`${base}/api/songs/${songId}/detail`);
        const data = await response.json();
        setDetail(data);
      } catch (error) {
        console.error('Error fetch song detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [songId]);

  useEffect(() => {
    const unsubscribe = audioPlayer.subscribe((state) => {
      setCurrentSongId(state.songId);
      setIsPlaying(state.isPlaying);
      setPositionMs(state.positionMs);
      setDurationMs(state.durationMs);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    return () => {
      if (currentSongId === Number(songId)) {
        audioPlayer.stopCurrent();
      }
    };
  }, [currentSongId, songId]);

  const stopCurrentSound = async () => {
    await audioPlayer.stopCurrent();
    setCurrentSongId(null);
    setIsPlaying(false);
    setPositionMs(0);
    setDurationMs(0);
  };

  const playSong = async (trackSong: RelatedSong | SongDetailItem) => {
    await audioPlayer.playTrack({ songId: trackSong.song_id, audioUrl: trackSong.audio_url });
  };

  const handleTogglePlay = async () => {
    if (currentSongId !== Number(songId)) {
      await playSong(song);
      return;
    }

    await audioPlayer.togglePlay();
  };

  const handleSkip = async (amountMs: number) => {
    await audioPlayer.skip(amountMs);
  };

  const formatTime = (ms: number) => {
    if (!Number.isFinite(ms) || ms <= 0) return '0:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  if (loading || !detail) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#A78BFA" />
          <Text style={styles.loadingText}>Đang tải bài hát...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { song, relatedByArtist, relatedByGenre } = detail;

  const openTrack = async (nextSongId: number) => {
    if (!nextSongId) return;

    await audioPlayer.stopCurrent();
    setCurrentSongId(null);
    setIsPlaying(false);
    setPositionMs(0);
    setDurationMs(0);
    router.push({ pathname: '/song-detail', params: { songId: String(nextSongId) } });
  };

  const renderRelatedList = (title: string, items: RelatedSong[]) => (
    <View style={styles.sectionWrap}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.length === 0 ? (
        <Text style={styles.emptyText}>Chưa có bài nào tương tự.</Text>
      ) : (
        items.map((item) => (
          <TouchableOpacity
            key={item.song_id}
            style={styles.relatedRow}
            onPress={async () => {
              await stopCurrentSound();
              router.push({ pathname: '/song-detail', params: { songId: String(item.song_id) } });
            }}
          >
            <Image
              source={{ uri: getCoverUrl(item.cover_url) }}
              style={styles.relatedCover}
            />
            <View style={styles.relatedInfo}>
              <Text style={styles.relatedTitle}>{item.title}</Text>
              <Text style={styles.relatedArtist}>{item.artist_name}</Text>
            </View>
            <Text style={styles.playBtn}>▶</Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <AppHeader title="Chi tiết bài hát" onBackPress={() => router.back()} />

        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
          <View style={styles.heroCard}>
            <Image
              source={{ uri: getCoverUrl(song.cover_url) }}
              style={styles.coverBig}
            />

            <Text style={styles.title}>{song.title}</Text>
            <Text style={styles.artist}>{song.artist_name}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{song.genre_name}</Text>
              <Text style={styles.metaText}>•</Text>
              <Text style={styles.metaText}>{song.duration}s</Text>
              <Text style={styles.metaText}>•</Text>
              <Text style={styles.metaText}>{song.play_count} nghe</Text>
            </View>

            <View style={styles.progressWrap}>
              <Text style={styles.timeText}>{formatTime(positionMs)}</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${durationMs ? (positionMs / durationMs) * 100 : 0}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.timeText}>{formatTime(durationMs)}</Text>
            </View>

            <View style={styles.controlsRow}>
              <TouchableOpacity style={styles.controlButton} onPress={() => handleSkip(-10000)}>
                <Text style={styles.controlText}>⏪ 10s</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryControlButton} onPress={handleTogglePlay}>
                <Text style={styles.primaryControlText}>{isPlaying ? '⏸' : '▶'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlButton} onPress={() => handleSkip(10000)}>
                <Text style={styles.controlText}>10s ⏩</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.label}>Tác giả</Text>
            <View style={styles.authorRow}>
              <Image
                source={{
                  uri:
                    song.artist_avatar ||
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
                }}
                style={styles.avatar}
              />
              <View style={styles.authorMeta}>
                <Text style={styles.authorName}>{song.artist_name}</Text>
                <Text style={styles.authorSub}>Nghệ sĩ</Text>
              </View>
            </View>

            <Text style={styles.label}>Lời bài hát</Text>
            <Text style={styles.lyricsText}>{song.lyrics || 'Bài hát chưa có lời.'}</Text>
          </View>

          {renderRelatedList('Nhạc cùng tác giả', relatedByArtist)}
          {renderRelatedList('Nhạc cùng thể loại', relatedByGenre)}
        </ScrollView>

        <Footer actions={footerActions} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#020817' },
  container: { flex: 1 },
  loadingWrap: {
    flex: 1,
    backgroundColor: '#020817',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#E2E8F0',
    marginTop: 12,
  },
  content: { flex: 1, paddingHorizontal: 16 },
  contentInner: { paddingBottom: 28 },
  heroCard: {
    backgroundColor: '#111827',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 18,
    marginTop: 14,
    alignItems: 'center',
  },
  coverBig: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    backgroundColor: '#1E293B',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 18,
    textAlign: 'center',
  },
  artist: {
    color: '#A5B4FC',
    fontSize: 16,
    marginTop: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  metaText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  progressWrap: {
    width: '100%',
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    color: '#CBD5E1',
    fontSize: 11,
    width: 34,
    textAlign: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 999,
  },
  controlsRow: {
    width: '100%',
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  controlButton: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  primaryControlButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
  },
  primaryControlText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 16,
    marginTop: 18,
  },
  label: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1E293B',
  },
  authorMeta: {
    marginLeft: 12,
  },
  authorName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  authorSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  lyricsText: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 22,
  },
  sectionWrap: {
    marginTop: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  relatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 10,
    marginBottom: 10,
  },
  relatedCover: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#1E293B',
  },
  relatedInfo: {
    flex: 1,
    marginLeft: 12,
  },
  relatedTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  relatedArtist: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  playBtn: {
    color: '#A78BFA',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 6,
  },
});
