import { detectApiBase } from '@/src/lib/api/detectApi';
import { audioPlayer } from '@/src/lib/audio-player';
import { getCoverUrl } from '@/src/lib/cover-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COVER_SIZE = Math.min(SCREEN_WIDTH - 64, 320);

export default function SongDetailScreen() {
  const router = useRouter();
  const { songId } = useLocalSearchParams<{ songId: string }>();

  const [detail, setDetail] = useState<SongDetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [currentSongId, setCurrentSongId] = useState<number | null>(null);

  // UI state
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [showLyrics, setShowLyrics] = useState(false);
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const [addingToPlaylistId, setAddingToPlaylistId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchUserPlaylists = async () => {
    try {
      const base = await detectApiBase();
      const res = await fetch(`${base}/api/playlists`);
      if (res.ok) {
        const data = await res.json();
        setUserPlaylists(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Lỗi fetch playlists:', e);
    }
  };

  const handleOpenAddToPlaylist = () => {
    setShowAddToPlaylistModal(true);
    fetchUserPlaylists();
  };

  const handleAddSongToPlaylist = async (pId: number) => {
    if (!detail) return;
    try {
      setAddingToPlaylistId(pId);
      const base = await detectApiBase();
      const res = await fetch(`${base}/api/playlists/${pId}/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ song_id: detail.song_id }),
      });

      if (res.ok) {
        setToastMessage('Đã thêm bài hát vào danh sách phát!');
        setTimeout(() => setToastMessage(null), 2500);
        setShowAddToPlaylistModal(false);
      }
    } catch (e) {
      console.error('Lỗi thêm bài hát vào playlist:', e);
    } finally {
      setAddingToPlaylistId(null);
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      if (!songId) return;

      try {
        const base = await detectApiBase();
        const response = await fetch(`${base}/api/songs/${songId}/detail`);
        const data = await response.json();
        setDetail(data?.song || data || null);
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

  const playSong = async (trackSong: SongDetailItem) => {
    await audioPlayer.playTrack({
      songId: trackSong.song_id,
      audioUrl: trackSong.audio_url,
      title: trackSong.title,
      coverUrl: trackSong.cover_url,
      artist: trackSong.artist_name,
    });
  };

  const handleTogglePlay = async () => {
    if (!detail) return;

    if (currentSongId !== Number(songId)) {
      await playSong(detail);
      return;
    }

    await audioPlayer.togglePlay();
  };

  const handleSkip = async (amountMs: number) => {
    await audioPlayer.skip(amountMs);
  };

  const [trackWidth, setTrackWidth] = useState(SCREEN_WIDTH - 48);

  const handleSeek = async (event: any) => {
    if (!durationMs || durationMs <= 0 || !Number.isFinite(durationMs)) return;

    const touchX = event?.nativeEvent?.locationX;
    if (typeof touchX !== 'number' || !Number.isFinite(touchX) || touchX < 0) return;

    const barWidth = trackWidth > 0 ? trackWidth : (SCREEN_WIDTH - 48);
    const targetRatio = Math.max(0, Math.min(1, touchX / barWidth));
    const seekPosition = Math.round(targetRatio * durationMs);

    if (Number.isFinite(seekPosition)) {
      await audioPlayer.seekTo(seekPosition);
    }
  };

  const formatTime = (ms: number) => {
    if (!Number.isFinite(ms) || ms <= 0) return '0:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  const progressPercent = durationMs > 0 ? Math.min(100, Math.max(0, (positionMs / durationMs) * 100)) : 0;

  const handleCloseDetail = () => {
    try {
      if (typeof (router as any).dismissAll === 'function') {
        (router as any).dismissAll();
        return;
      }
    } catch {
      // ignore
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate('/(tabs)');
    }
  };

  if (loading || !detail) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#38BDF8" />
          <Text style={styles.loadingText}>Đang tải chi tiết bài hát...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleCloseDetail} style={styles.iconButton} activeOpacity={0.7}>
            <MaterialIcons name="keyboard-arrow-down" size={32} color="#F8FAFC" />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerSubTitle}>ĐANG PHÁT TỪ THỂ LOẠI</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {detail.genre_name.toUpperCase()}
            </Text>
          </View>

          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <MaterialIcons name="more-vert" size={26} color="#F8FAFC" />
          </TouchableOpacity>
        </View>

        {/* Cover Image */}
        <View style={styles.coverContainer}>
          <View style={styles.coverWrap}>
            <Image
              source={{ uri: getCoverUrl(detail.cover_url) }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Song Info & Favorite Button */}
        <View style={styles.titleRow}>
          <View style={styles.textWrap}>
            <Text style={styles.songTitle} numberOfLines={2}>
              {detail.title}
            </Text>
            <Text style={styles.artistName} numberOfLines={1}>
              {detail.artist_name}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.heartButton}
            onPress={() => setIsLiked(!isLiked)}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name={isLiked ? 'favorite' : 'favorite-border'}
              size={28}
              color={isLiked ? '#EC4899' : '#94A3B8'}
            />
          </TouchableOpacity>
        </View>

        {/* Progress Bar Section */}
        <View style={styles.progressSection}>
          <Pressable
            style={styles.progressTouchArea}
            onLayout={(e) => {
              const w = e?.nativeEvent?.layout?.width;
              if (typeof w === 'number' && w > 0) setTrackWidth(w);
            }}
            onPress={handleSeek}
          >
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
              <View style={[styles.progressThumb, { left: `${progressPercent}%` }]} />
            </View>
          </Pressable>

          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(positionMs)}</Text>
            <Text style={styles.timeText}>-{formatTime(Math.max(durationMs - positionMs, 0))}</Text>
          </View>
        </View>

        {/* Playback Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setIsShuffle(!isShuffle)}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="shuffle"
              size={26}
              color={isShuffle ? '#38BDF8' : '#94A3B8'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleSkip(-10000)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="skip-previous" size={38} color="#F8FAFC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleTogglePlay}
            activeOpacity={0.85}
          >
            <MaterialIcons
              name={isPlaying ? 'pause' : 'play-arrow'}
              size={40}
              color="#0F172A"
              style={{ marginLeft: isPlaying ? 0 : 3 }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleSkip(10000)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="skip-next" size={38} color="#F8FAFC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              setRepeatMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'))
            }
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={repeatMode === 'one' ? 'repeat-one' : 'repeat'}
              size={26}
              color={repeatMode !== 'off' ? '#38BDF8' : '#94A3B8'}
            />
          </TouchableOpacity>
        </View>

        {/* Bottom Actions Row */}
        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={[styles.bottomChip, detail.lyrics ? styles.activeChip : null]}
            onPress={() => setShowLyrics(true)}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name="subtitles"
              size={18}
              color={detail.lyrics ? '#38BDF8' : '#94A3B8'}
            />
            <Text style={[styles.bottomChipText, detail.lyrics ? styles.activeChipText : null]}>
              Lời bài hát
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomChip} activeOpacity={0.8} onPress={handleOpenAddToPlaylist}>
            <MaterialIcons name="playlist-add" size={20} color="#38BDF8" />
            <Text style={styles.bottomChipText}>Thêm vào DS</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomChip} activeOpacity={0.8}>
            <MaterialIcons name="share" size={18} color="#94A3B8" />
            <Text style={styles.bottomChipText}>Chia sẻ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Lyrics Modal */}
      <Modal visible={showLyrics} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lời bài hát - {detail.title}</Text>
              <TouchableOpacity onPress={() => setShowLyrics(false)} style={styles.closeModalButton}>
                <MaterialIcons name="close" size={24} color="#F8FAFC" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.lyricsScroll}>
              <Text style={styles.lyricsText}>
                {detail.lyrics || 'Chưa có lời bài hát cho ca khúc này.'}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add To Playlist Modal */}
      <Modal visible={showAddToPlaylistModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm vào danh sách phát</Text>
              <TouchableOpacity onPress={() => setShowAddToPlaylistModal(false)} style={styles.closeModalButton}>
                <MaterialIcons name="close" size={24} color="#F8FAFC" />
              </TouchableOpacity>
            </View>

            {userPlaylists.length === 0 ? (
              <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                <Text style={{ color: '#94A3B8', fontSize: 14 }}>Chưa có danh sách phát nào.</Text>
                <Text style={{ color: '#64748B', fontSize: 12, marginTop: 4 }}>Vào Thư viện để tạo danh sách phát mới.</Text>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 300, marginTop: 8 }}>
                {userPlaylists.map((pl) => (
                  <TouchableOpacity
                    key={pl.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      paddingHorizontal: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: 'rgba(255,255,255,0.08)',
                    }}
                    onPress={() => handleAddSongToPlaylist(pl.id)}
                    disabled={addingToPlaylistId === pl.id}
                  >
                    <MaterialIcons name="playlist-play" size={28} color="#38BDF8" style={{ marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 }}>{pl.title}</Text>
                      <Text style={{ color: '#94A3B8', fontSize: 12 }}>{pl.song_count || 0} bài hát</Text>
                    </View>
                    <MaterialIcons name="add" size={24} color="#38BDF8" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Toast Notification */}
      {toastMessage ? (
        <View
          style={{
            position: 'absolute',
            bottom: 40,
            left: 20,
            right: 20,
            backgroundColor: '#1E293B',
            borderColor: '#38BDF8',
            borderWidth: 1,
            borderRadius: 12,
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 10,
          }}
        >
          <MaterialIcons name="check-circle" size={22} color="#38BDF8" style={{ marginRight: 10 }} />
          <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 14 }}>{toastMessage}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 28,
    justifyContent: 'space-between',
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B132B',
  },
  loadingText: {
    marginTop: 12,
    color: '#94A3B8',
    fontSize: 15,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleWrap: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 12,
  },
  headerSubTitle: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  coverContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  coverWrap: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    shadowColor: '#38BDF8',
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 12,
  },
  textWrap: {
    flex: 1,
    paddingRight: 16,
  },
  songTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 4,
  },
  artistName: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '600',
  },
  heartButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSection: {
    marginTop: 12,
    marginBottom: 8,
  },
  progressTouchArea: {
    paddingVertical: 10,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    position: 'relative',
    justifyContent: 'center',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 3,
    backgroundColor: '#38BDF8',
  },
  progressThumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#F8FAFC',
    marginLeft: -7,
    shadowColor: '#38BDF8',
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  timeText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 4,
  },
  secondaryButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#38BDF8',
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  bottomRow: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  bottomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: 6,
  },
  activeChip: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  bottomChipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  activeChipText: {
    color: '#38BDF8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  closeModalButton: {
    padding: 4,
  },
  lyricsScroll: {
    marginTop: 8,
  },
  lyricsText: {
    color: '#CBD5E1',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
  },
});