import { AppHeader } from '@/src/components/ui/app-header';
import { Footer } from '@/src/components/ui/footer';
import { useFooterActions } from '@/src/constants/footer-actions';
import { detectApiBase } from '@/src/lib/api/detectApi';
import { audioPlayer } from '@/src/lib/audio-player';
import { getCoverUrl } from '@/src/lib/cover-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ArtistInfo {
  artist_id: number;
  name: string;
  bio: string;
  avatar_url?: string;
}

interface ArtistSongItem {
  song_id: number;
  title: string;
  duration: number;
  audio_url: string;
  cover_url: string;
  artist_name: string;
}

export default function ArtistDetailScreen() {
  const router = useRouter();
  const footerActions = useFooterActions('library');
  const { artistId } = useLocalSearchParams<{ artistId: string }>();

  const [artist, setArtist] = useState<ArtistInfo | null>(null);
  const [songs, setSongs] = useState<ArtistSongItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArtistDetail = useCallback(async () => {
    if (!artistId) return;

    try {
      setLoading(true);
      const base = await detectApiBase();
      const res = await fetch(`${base}/api/artists/${artistId}`);
      if (res.ok) {
        const data = await res.json();
        setArtist(data.artist || null);
        setSongs(Array.isArray(data.songs) ? data.songs : []);
      } else {
        console.warn('Lỗi lấy artist detail:', res.status);
      }
    } catch (error) {
      console.error('Lỗi fetch artist detail:', error);
    } finally {
      setLoading(false);
    }
  }, [artistId]);

  useEffect(() => {
    fetchArtistDetail();
  }, [fetchArtistDetail]);

  const handlePlaySong = async (song: ArtistSongItem) => {
    await audioPlayer.playTrack({
      songId: song.song_id,
      audioUrl: song.audio_url,
      title: song.title,
      artist: song.artist_name,
      coverUrl: song.cover_url,
    });
    router.push({ pathname: '/song-detail', params: { songId: String(song.song_id) } });
  };

  const handlePlayAll = async () => {
    if (songs.length === 0) return;
    const firstSong = songs[0];
    await handlePlaySong(firstSong);
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <AppHeader title={artist?.name || 'Nghệ sĩ'} onBackPress={() => router.back()} />

        {loading ? (
          <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: 40, flex: 1 }} />
        ) : (
          <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
            <View style={styles.bannerContainer}>
              <Image
                source={{
                  uri: getCoverUrl(
                    artist?.avatar_url || (songs.length > 0 ? songs[0].cover_url : null)
                  ),
                }}
                style={styles.bannerCover}
              />

              <Text style={styles.playlistTitle}>{artist?.name || 'Nghệ sĩ'}</Text>
              <Text style={styles.playlistSubtitle}>
                {songs.length} bài hát
              </Text>
              {artist?.bio && artist.bio !== 'Chưa có tiểu sử.' && (
                <Text style={styles.artistBio}>{artist.bio}</Text>
              )}

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.playAllBtn, songs.length === 0 && styles.btnDisabled]}
                  onPress={handlePlayAll}
                  disabled={songs.length === 0}
                >
                  <MaterialIcons name="play-arrow" size={26} color="#0F172A" />
                  <Text style={styles.playAllText}>Phát tất cả</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.sectionHeaderTitle}>Danh sách bài hát</Text>

            {songs.length === 0 ? (
              <View style={styles.emptyBox}>
                <MaterialIcons name="music-off" size={48} color="#334155" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyText}>Nghệ sĩ này chưa có bài hát nào.</Text>
              </View>
            ) : (
              <View style={styles.songList}>
                {songs.map((song, index) => (
                  <View key={`${song.song_id}-${index}`} style={styles.songRow}>
                    <Text style={styles.songIndex}>{index + 1}</Text>
                    <TouchableOpacity
                      style={styles.songTouchWrap}
                      onPress={() => handlePlaySong(song)}
                    >
                      <Image source={{ uri: getCoverUrl(song.cover_url) }} style={styles.songCover} />
                      <View style={styles.songMainInfo}>
                        <Text style={styles.songTitle} numberOfLines={1}>
                          {song.title}
                        </Text>
                        <Text style={styles.songArtist} numberOfLines={1}>
                          {song.artist_name}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <Text style={styles.songDuration}>{formatDuration(song.duration)}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}

        <Footer actions={footerActions} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B1120' },
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 16 },
  contentInner: { paddingBottom: 24 },
  bannerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    marginBottom: 20,
  },
  bannerCover: {
    width: 140,
    height: 140,
    borderRadius: 70, // Tròn cho nghệ sĩ
    backgroundColor: '#1E293B',
    marginBottom: 16,
  },
  playlistTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  playlistSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  artistBio: {
    color: '#CBD5E1',
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 18,
  },
  playAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#38BDF8',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    gap: 6,
  },
  playAllText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 14,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  sectionHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  emptyBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
  },
  songList: {
    gap: 8,
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  songIndex: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
    width: 24,
    textAlign: 'center',
  },
  songTouchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  songCover: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  songMainInfo: {
    flex: 1,
    marginLeft: 10,
  },
  songTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  songArtist: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  songDuration: {
    color: '#64748B',
    fontSize: 12,
    marginRight: 10,
  }
});
