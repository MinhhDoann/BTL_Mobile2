import { useAuth } from '@/src/contexts/auth';
import { detectApiBase } from '@/src/lib/api/detectApi';
import { audioPlayer } from '@/src/lib/audio-player';
import { getCoverUrl } from '@/src/lib/cover-image';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Linking,
    Dimensions,
    Pressable,
    Modal,
    Alert,
    TextInput,
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

  const { user } = useAuth();
  const [detail, setDetail] = useState<SongDetailItem | null>(null);
  const [artistSongs, setArtistSongs] = useState<any[]>([]);
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
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const [addingToPlaylistId, setAddingToPlaylistId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Complaint modal state
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintReason, setComplaintReason] = useState<'Bản quyền' | 'Nội dung bài hát' | 'Khác'>('Bản quyền');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  const handleSubmitComplaint = async () => {
    if (!detail) return;
    try {
      setSubmittingComplaint(true);
      const base = await detectApiBase();
      const res = await fetch(`${base}/api/songs/${detail.song_id}/complaint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.user_id,
          reason_type: complaintReason,
          description: complaintDescription,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setShowComplaintModal(false);
        setComplaintDescription('');
        setToastMessage('Đã gửi khiếu nại bài hát thành công! Ban quản trị sẽ xử lý.');
        setTimeout(() => setToastMessage(null), 3000);
      } else {
        Alert.alert('Lỗi', data.message || 'Không thể gửi khiếu nại.');
      }
    } catch (e) {
      console.error('Lỗi gửi khiếu nại:', e);
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ.');
    } finally {
      setSubmittingComplaint(false);
    }
  };

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
        setArtistSongs(data?.relatedByArtist || []);
      } catch (error) {
        console.error('Error fetch song detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [songId]);

  useEffect(() => {
    if (detail?.artist_id) {
      const recordAdView = async () => {
        try {
          const base = await detectApiBase();
          await fetch(`${base}/api/artist/${detail.artist_id}/ad-interaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'view' }),
          });
        } catch (err) {}
      };
      recordAdView();
    }
  }, [detail?.artist_id]);

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Thông báo', `Không thể mở liên kết: ${url}`);
      }
    } catch (err) {
      console.error('Lỗi khi mở đường dẫn:', err);
    }
  };

  const handleAdClick = async () => {
    if (detail?.artist_id) {
      try {
        const base = await detectApiBase();
        await fetch(`${base}/api/artist/${detail.artist_id}/ad-interaction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'click' }),
        });
      } catch (err) {}
    }
    setShowSponsorModal(true);
  };

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
      artist: trackSong.artist_name,
      coverUrl: trackSong.cover_url,
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

        <View style={styles.playerCardContainer}>

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

          <TouchableOpacity style={styles.bottomChip} activeOpacity={0.8} onPress={() => setShowComplaintModal(true)}>
            <MaterialIcons name="report" size={18} color="#EF4444" />
            <Text style={[styles.bottomChipText, { color: '#EF4444' }]}>Khiếu nại</Text>
          </TouchableOpacity>
        </View>

        </View>

        {/* Quảng cáo Banner */}
        <TouchableOpacity style={styles.adBannerTouch} onPress={handleAdClick} activeOpacity={0.9}>
          <Image source={{ uri: 'https://dummyimage.com/600x120/111827/a78bfa.png&text=Sponsor+Ad' }} style={styles.adBannerImg} resizeMode='contain' />
        </TouchableOpacity>

        {/* Tác giả */}
        <Text style={styles.sectionHeading}>Tác giả</Text>
        <TouchableOpacity style={styles.artistCard} onPress={() => {}}>
          <Image source={{ uri: detail.artist_avatar ? getCoverUrl(detail.artist_avatar) : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400' }} style={styles.artistAvatar} />
          <View style={styles.artistCardTextWrap}>
            <Text style={styles.artistCardName}>{detail.artist_name}</Text>
            <Text style={styles.artistCardRole}>Nghệ sĩ</Text>
          </View>
        </TouchableOpacity>

        {/* Lời bài hát */}
        <Text style={styles.sectionHeading}>Lời bài hát</Text>
        <View style={styles.lyricsCard}>
          <Text style={styles.lyricsPreviewText}>{detail.lyrics || 'Bài hát chưa có lời.'}</Text>
        </View>

        {/* Nhạc cùng tác giả */}
        <Text style={styles.sectionHeading}>Nhạc cùng tác giả</Text>
        {artistSongs.length > 0 ? (
          <View style={styles.artistSongsCard}>
            {artistSongs.map((s, idx) => (
              <TouchableOpacity key={s.song_id} style={[styles.songItem, idx > 0 && styles.songItemBorder]} onPress={() => playSong(s)}>
                <Image source={{ uri: getCoverUrl(s.cover_url) }} style={styles.songItemCover} />
                <View style={styles.songItemTextWrap}>
                  <Text style={styles.songItemTitle} numberOfLines={1}>{s.title}</Text>
                  <Text style={styles.songItemArtist} numberOfLines={1}>{s.artist_name}</Text>
                </View>
                <MaterialIcons name="play-arrow" size={28} color="#a78bfa" />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.noSongsText}>Khám phá thêm sau.</Text>
        )}
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
            <Text style={{ color: '#94A3B8', textAlign: 'center', marginTop: 20 }}>
              Bạn chưa có danh sách phát nào.
            </Text>
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

      {/* Complaint Modal */}
      <Modal visible={showComplaintModal} animationType="slide" transparent={true} onRequestClose={() => setShowComplaintModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Khiếu nại bài hát</Text>
                <Text style={{ color: '#94A3B8', fontSize: 13, marginTop: 2 }} numberOfLines={1}>
                  {detail.title} - {detail.artist_name}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowComplaintModal(false)} style={styles.closeModalButton}>
                <MaterialIcons name="close" size={24} color="#F8FAFC" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ marginTop: 8 }} keyboardShouldPersistTaps="handled">
              <Text style={{ color: '#E2E8F0', fontWeight: '600', marginBottom: 8, fontSize: 14 }}>
                Lý do khiếu nại:
              </Text>
              
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {[
                  { key: 'Bản quyền', label: '🛡️ Bản quyền' },
                  { key: 'Nội dung bài hát', label: '⚠️ Nội dung bài hát' },
                  { key: 'Khác', label: '📝 Lý do khác' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    onPress={() => setComplaintReason(item.key as any)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: complaintReason === item.key ? '#312E81' : '#0F172A',
                      borderWidth: 1,
                      borderColor: complaintReason === item.key ? '#818CF8' : '#1E293B',
                    }}
                  >
                    <Text style={{ color: complaintReason === item.key ? '#818CF8' : '#94A3B8', fontWeight: '600', fontSize: 13 }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ color: '#E2E8F0', fontWeight: '600', marginBottom: 8, fontSize: 14 }}>
                Mô tả chi tiết:
              </Text>
              <TextInput
                style={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 12,
                  color: '#FFFFFF',
                  minHeight: 90,
                  textAlignVertical: 'top',
                  fontSize: 14,
                  marginBottom: 20,
                }}
                placeholder="Nhập nội dung chi tiết về vấn đề khiếu nại (bản quyền, vi phạm, v.v.)..."
                placeholderTextColor="#64748B"
                multiline
                value={complaintDescription}
                onChangeText={setComplaintDescription}
              />

              <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'flex-end', marginBottom: 8 }}>
                <TouchableOpacity
                  onPress={() => setShowComplaintModal(false)}
                  style={{
                    paddingHorizontal: 18,
                    paddingVertical: 12,
                    borderRadius: 10,
                    backgroundColor: '#334155',
                  }}
                >
                  <Text style={{ color: '#E2E8F0', fontWeight: '600' }}>Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmitComplaint}
                  disabled={submittingComplaint}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderRadius: 10,
                    backgroundColor: '#EF4444',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    opacity: submittingComplaint ? 0.7 : 1,
                  }}
                >
                  {submittingComplaint ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <MaterialIcons name="send" size={18} color="#FFFFFF" />
                  )}
                  <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                    {submittingComplaint ? 'Đang gửi...' : 'Gửi khiếu nại'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Sponsor Links Modal */}
      <Modal
        visible={showSponsorModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSponsorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Liên Hệ & Nhà Tài Trợ 🚀</Text>
                <Text style={{ color: '#94A3B8', fontSize: 13, marginTop: 2 }}>
                  Chọn liên kết bạn muốn truy cập bên dưới
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowSponsorModal(false)}
                style={styles.closeModalButton}
              >
                <MaterialIcons name="close" size={24} color="#F8FAFC" />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12, marginTop: 8, marginBottom: 12 }}>
              {/* Facebook Link */}
              <TouchableOpacity
                style={styles.sponsorLinkCard}
                activeOpacity={0.7}
                onPress={() => handleOpenLink('https://www.facebook.com')}
              >
                <View style={[styles.sponsorIconWrap, { backgroundColor: 'rgba(24, 119, 242, 0.15)' }]}>
                  <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.sponsorLinkTitle}>Facebook hiện tại</Text>
                  <Text style={styles.sponsorLinkSubtitle}>https://www.facebook.com</Text>
                </View>
                <MaterialIcons name="open-in-new" size={20} color="#64748B" />
              </TouchableOpacity>

              {/* GitHub Link */}
              <TouchableOpacity
                style={styles.sponsorLinkCard}
                activeOpacity={0.7}
                onPress={() => handleOpenLink('https://github.com/MinhhDoann/BTL_Mobile2')}
              >
                <View style={[styles.sponsorIconWrap, { backgroundColor: 'rgba(240, 246, 252, 0.15)' }]}>
                  <Ionicons name="logo-github" size={24} color="#F0F6FC" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.sponsorLinkTitle}>GitHub của project</Text>
                  <Text style={styles.sponsorLinkSubtitle}>github.com/MinhhDoann/BTL_Mobile2</Text>
                </View>
                <MaterialIcons name="open-in-new" size={20} color="#64748B" />
              </TouchableOpacity>

              {/* Gmail Link */}
              <TouchableOpacity
                style={styles.sponsorLinkCard}
                activeOpacity={0.7}
                onPress={() => handleOpenLink('mailto:minhdoan.contact@gmail.com')}
              >
                <View style={[styles.sponsorIconWrap, { backgroundColor: 'rgba(234, 67, 53, 0.15)' }]}>
                  <Ionicons name="mail" size={24} color="#EA4335" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.sponsorLinkTitle}>Gmail liên hệ</Text>
                  <Text style={styles.sponsorLinkSubtitle}>minhdoan.contact@gmail.com</Text>
                </View>
                <MaterialIcons name="open-in-new" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
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
    justifyContent: 'space-between',
    gap: 8,
    width: '100%',
  },
  bottomChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: 4,
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
    lineHeight: 28,
    textAlign: 'center',
  },
  playerCardContainer: {
    backgroundColor: '#131c31',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  adBannerTouch: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  adBannerImg: {
    width: '100%',
    height: 80,
  },
  sectionHeading: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  artistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131c31',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  artistAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1E293B',
  },
  artistCardTextWrap: {
    marginLeft: 16,
    flex: 1,
  },
  artistCardName: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: 'bold',
  },
  artistCardRole: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 2,
  },
  lyricsCard: {
    backgroundColor: '#131c31',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  lyricsPreviewText: {
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 24,
  },
  artistSongsCard: {
    backgroundColor: 'transparent',
    gap: 12,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131c31',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  songItemBorder: {},
  songItemCover: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#1E293B',
  },
  songItemTextWrap: {
    flex: 1,
    marginLeft: 16,
  },
  songItemTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  songItemArtist: {
    color: '#94A3B8',
    fontSize: 13,
  },
  noSongsText: {
    color: '#64748B',
    fontSize: 14,
  },
  sponsorLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  sponsorIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sponsorLinkTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  sponsorLinkSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
});