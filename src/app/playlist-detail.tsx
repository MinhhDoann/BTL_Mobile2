import { AppHeader } from '@/src/components/ui/app-header';
import { Footer } from '@/src/components/ui/footer';
import { MiniPlayer } from '@/src/components/ui/mini-player';
import { useFooterActions } from '@/src/constants/footer-actions';
import { detectApiBase } from '@/src/lib/api/detectApi';
import { audioPlayer } from '@/src/lib/audio-player';
import { getCoverUrl } from '@/src/lib/cover-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PlaylistInfo {
  playlist_id: number;
  title: string;
  description: string;
  cover_url?: string;
  created_at?: string;
}

interface PlaylistSongItem {
  song_id: number;
  title: string;
  duration: number;
  audio_url: string;
  cover_url: string;
  artist_name: string;
}

interface AvailableSong {
  song_id: number;
  title: string;
  cover_url: string;
  audio_url: string;
  artist_name: string;
}

export default function PlaylistDetailScreen() {
  const router = useRouter();
  const footerActions = useFooterActions('library');
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();

  const [playlist, setPlaylist] = useState<PlaylistInfo | null>(null);
  const [songs, setSongs] = useState<PlaylistSongItem[]>([]);
  const [loading, setLoading] = useState(true);

  // State cho Modal thêm bài hát
  const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);
  const [allAvailableSongs, setAllAvailableSongs] = useState<AvailableSong[]>([]);
  const [songSearchQuery, setSongSearchQuery] = useState('');
  const [addingSongId, setAddingSongId] = useState<number | null>(null);

  const fetchPlaylistDetail = useCallback(async () => {
    if (!playlistId) return;

    try {
      setLoading(true);
      const base = await detectApiBase();
      const res = await fetch(`${base}/api/playlists/${playlistId}`);
      if (res.ok) {
        const data = await res.json();
        setPlaylist(data.playlist || null);
        setSongs(Array.isArray(data.songs) ? data.songs : []);
      } else {
        console.warn('Lỗi lấy playlist detail:', res.status);
      }
    } catch (error) {
      console.error('Lỗi fetch playlist detail:', error);
    } finally {
      setLoading(false);
    }
  }, [playlistId]);

  useEffect(() => {
    fetchPlaylistDetail();
  }, [fetchPlaylistDetail]);

  // Lấy tất cả các bài hát sẵn có trong hệ thống khi mở Modal Thêm bài hát
  const fetchAllAvailableSongs = async () => {
    try {
      const base = await detectApiBase();
      const res = await fetch(`${base}/api/home-data`);
      if (res.ok) {
        const data = await res.json();
        const extracted: AvailableSong[] = [];
        const seenIds = new Set<number>();

        data.forEach((genre: any) => {
          (genre.songs || []).forEach((s: any) => {
            if (!seenIds.has(s.song_id)) {
              seenIds.add(s.song_id);
              extracted.push({
                song_id: s.song_id,
                title: s.title,
                cover_url: s.cover_url,
                audio_url: s.audio_url,
                artist_name: s.artist_name || 'Nghệ sĩ',
              });
            }
          });
        });

        setAllAvailableSongs(extracted);
      }
    } catch (e) {
      console.error('Lỗi lấy danh sách bài hát:', e);
    }
  };

  const handleOpenAddSongModal = () => {
    setIsAddSongModalOpen(true);
    fetchAllAvailableSongs();
  };

  const handleAddSongToPlaylist = async (song: AvailableSong) => {
    if (!playlistId) return;
    try {
      setAddingSongId(song.song_id);
      const base = await detectApiBase();
      const res = await fetch(`${base}/api/playlists/${playlistId}/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ song_id: song.song_id }),
      });

      if (res.ok) {
        // Tải lại danh sách bài hát trong playlist
        fetchPlaylistDetail();
      }
    } catch (e) {
      console.error('Lỗi thêm bài hát vào playlist:', e);
    } finally {
      setAddingSongId(null);
    }
  };

  const handleRemoveSongFromPlaylist = async (songId: number) => {
    if (!playlistId) return;

    try {
      const base = await detectApiBase();
      const res = await fetch(`${base}/api/playlists/${playlistId}/songs/${songId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSongs((prev) => prev.filter((s) => s.song_id !== songId));
      }
    } catch (e) {
      console.error('Lỗi xóa bài hát khỏi playlist:', e);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!playlistId) return;

    const doDelete = async () => {
      try {
        const base = await detectApiBase();
        await fetch(`${base}/api/playlists/${playlistId}`, { method: 'DELETE' });
        router.back();
      } catch (e) {
        console.error('Lỗi xóa playlist:', e);
      }
    };

    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm('Bạn có chắc muốn xóa danh sách phát này?')) {
        doDelete();
      }
    } else {
      Alert.alert('Xóa danh sách phát', 'Bạn có chắc chắn muốn xóa?', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const handlePlaySong = async (song: PlaylistSongItem) => {
    await audioPlayer.playTrack({
      songId: song.song_id,
      audioUrl: song.audio_url,
      title: song.title,
      artistName: song.artist_name,
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

  const filteredAvailableSongs = allAvailableSongs.filter((s) => {
    const q = songSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return s.title.toLowerCase().includes(q) || s.artist_name.toLowerCase().includes(q);
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <AppHeader title={playlist?.title || 'Danh sách phát'} onBackPress={() => router.back()} />

        {loading ? (
          <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: 40, flex: 1 }} />
        ) : (
          <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
            {/* Header Playlist Banner */}
            <View style={styles.bannerContainer}>
              <Image
                source={{
                  uri: getCoverUrl(
                    playlist?.cover_url || (songs.length > 0 ? songs[0].cover_url : null)
                  ),
                }}
                style={styles.bannerCover}
              />

              <Text style={styles.playlistTitle}>{playlist?.title || 'Danh sách phát'}</Text>
              <Text style={styles.playlistSubtitle}>
                {songs.length} bài hát • {playlist?.description || 'Danh sách phát của tôi'}
              </Text>

              {/* Actions Row */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.playAllBtn, songs.length === 0 && styles.btnDisabled]}
                  onPress={handlePlayAll}
                  disabled={songs.length === 0}
                >
                  <MaterialIcons name="play-arrow" size={26} color="#0F172A" />
                  <Text style={styles.playAllText}>Phát tất cả</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.addSongBtn} onPress={handleOpenAddSongModal}>
                  <MaterialIcons name="playlist-add" size={22} color="#38BDF8" />
                  <Text style={styles.addSongText}>Thêm bài hát</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteBtn} onPress={handleDeletePlaylist}>
                  <MaterialIcons name="delete-outline" size={22} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Song List */}
            <Text style={styles.sectionHeaderTitle}>Danh sách bài hát</Text>

            {songs.length === 0 ? (
              <View style={styles.emptyBox}>
                <MaterialIcons name="music-off" size={48} color="#334155" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyText}>Chưa có bài hát nào trong danh sách này.</Text>
                <TouchableOpacity style={styles.addFirstSongBtn} onPress={handleOpenAddSongModal}>
                  <Text style={styles.addFirstSongText}>+ Thêm bài hát ngay</Text>
                </TouchableOpacity>
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

                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => handleRemoveSongFromPlaylist(song.song_id)}
                    >
                      <MaterialIcons name="close" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}

        {/* Modal Thêm bài hát vào danh sách phát */}
        <Modal
          visible={isAddSongModalOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setIsAddSongModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Thêm bài hát vào DS phát</Text>
                <TouchableOpacity onPress={() => setIsAddSongModalOpen(false)}>
                  <MaterialIcons name="close" size={24} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* Thanh Tìm kiếm trong Modal */}
              <View style={styles.searchWrap}>
                <MaterialIcons name="search" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Tìm theo tên bài hát, nghệ sĩ..."
                  placeholderTextColor="#64748B"
                  value={songSearchQuery}
                  onChangeText={setSongSearchQuery}
                />
              </View>

              <FlatList
                data={filteredAvailableSongs}
                keyExtractor={(item) => String(item.song_id)}
                contentContainerStyle={{ paddingVertical: 8 }}
                renderItem={({ item }) => {
                  const isInPlaylist = songs.some((s) => s.song_id === item.song_id);
                  const isAdding = addingSongId === item.song_id;

                  return (
                    <View style={styles.modalSongRow}>
                      <Image source={{ uri: getCoverUrl(item.cover_url) }} style={styles.modalCover} />
                      <View style={styles.modalSongInfo}>
                        <Text style={styles.modalSongTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.modalSongArtist} numberOfLines={1}>
                          {item.artist_name}
                        </Text>
                      </View>

                      {isInPlaylist ? (
                        <View style={styles.addedBadge}>
                          <MaterialIcons name="check" size={16} color="#38BDF8" />
                          <Text style={styles.addedBadgeText}>Đã thêm</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.addPlusBtn}
                          onPress={() => handleAddSongToPlaylist(item)}
                          disabled={isAdding}
                        >
                          {isAdding ? (
                            <ActivityIndicator size="small" color="#0F172A" />
                          ) : (
                            <Text style={styles.addPlusText}>+ Thêm</Text>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                }}
              />
            </View>
          </View>
        </Modal>

        <MiniPlayer />
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
    borderRadius: 16,
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
  addSongBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 6,
  },
  addSongText: {
    color: '#38BDF8',
    fontWeight: '600',
    fontSize: 13,
  },
  deleteBtn: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
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
  addFirstSongBtn: {
    marginTop: 16,
    backgroundColor: '#1E293B',
    borderColor: '#38BDF8',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addFirstSongText: {
    color: '#38BDF8',
    fontWeight: '600',
    fontSize: 13,
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
  },
  removeBtn: {
    padding: 6,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  modalSongRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  modalCover: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#0F172A',
  },
  modalSongInfo: {
    flex: 1,
    marginLeft: 12,
  },
  modalSongTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalSongArtist: {
    color: '#94A3B8',
    fontSize: 12,
  },
  addPlusBtn: {
    backgroundColor: '#38BDF8',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  addPlusText: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: 12,
  },
  addedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addedBadgeText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
  },
});
