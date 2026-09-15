import { AppHeader } from '@/src/components/ui/app-header';
import { Footer } from '@/src/components/ui/footer';
import { SongData, SongItem } from '@/src/components/ui/song-item';
import { useFooterActions } from '@/src/constants/footer-actions';
import React, { useEffect, useState } from 'react';
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

interface Playlist {
  playlist_id: number;
  title: string;
  description: string;
  cover_url?: string;
  total_songs: number;
}

interface Artist {
  artist_id: number;
  name: string;
  avatar_url?: string;
}

export default function LibraryScreen() {
  const footerActions = useFooterActions('library');
  const [filterTab, setFilterTab] = useState<'all' | 'playlists' | 'artists'>('all');
  
  // Dữ liệu thư viện
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [likedCount, setLikedCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Xem chi tiết playlist hoặc Bài hát yêu thích
  const [selectedPlaylistSongs, setSelectedPlaylistSongs] = useState<SongData[] | null>(null);
  const [viewingTitle, setViewingTitle] = useState<string>('');

  // Modal tạo Playlist mới
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState<string>('');

  useEffect(() => {
    fetchLibraryData();
  }, []);

  const fetchLibraryData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/library');
      const data = await response.json();
      setPlaylists(data.playlists || []);
      setLikedCount(data.liked_songs_count || 0);
      setArtists(data.followed_artists || []);
    } catch (error) {
      console.error('Lỗi lấy dữ liệu thư viện:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mở bài hát yêu thích (Liked Songs)
  const openLikedSongs = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/library/favorites');
      const songs = await response.json();
      setSelectedPlaylistSongs(songs);
      setViewingTitle('Bài Hát Đã Thích');
    } catch (error) {
      console.error('Lỗi lấy danh sách bài hát yêu thích:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mở chi tiết 1 Playlist
  const openPlaylist = async (playlist: Playlist) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/library/playlist/${playlist.playlist_id}`);
      const data = await response.json();
      setSelectedPlaylistSongs(data.songs || []);
      setViewingTitle(playlist.title);
    } catch (error) {
      console.error('Lỗi lấy chi tiết playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tạo playlist mới
  const handleCreatePlaylist = async () => {
    if (!newPlaylistTitle.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên playlist');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/library/playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newPlaylistTitle }),
      });
      const data = await response.json();
      if (data.playlist_id) {
        Alert.alert('Thành công', `Đã tạo danh sách phát: ${newPlaylistTitle}`);
        setNewPlaylistTitle('');
        setModalVisible(false);
        fetchLibraryData(); // Tải lại thư viện
      }
    } catch (error) {
      console.error('Lỗi tạo playlist:', error);
    }
  };

  // Phát bài hát khi bấm vào SongItem
  const handlePlaySong = (song: SongData) => {
    Alert.alert('Phát Nhạc', `Đang phát bài: ${song.title} - ${song.artist_name}`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <AppHeader
          title={selectedPlaylistSongs ? viewingTitle : 'Thư Viện'}
          onBackPress={() => {
            if (selectedPlaylistSongs) {
              setSelectedPlaylistSongs(null);
            }
          }}
        />

        <View style={styles.content}>
          {/* Nút hành động và lọc */}
          {!selectedPlaylistSongs && (
            <View style={styles.headerBar}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.menu}>
                <TouchableOpacity
                  onPress={() => setFilterTab('all')}
                  style={[styles.chip, filterTab === 'all' && styles.chipActive]}
                >
                  <Text style={[styles.chipText, filterTab === 'all' && styles.chipTextActive]}>Tất cả</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setFilterTab('playlists')}
                  style={[styles.chip, filterTab === 'playlists' && styles.chipActive]}
                >
                  <Text style={[styles.chipText, filterTab === 'playlists' && styles.chipTextActive]}>Playlists</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setFilterTab('artists')}
                  style={[styles.chip, filterTab === 'artists' && styles.chipActive]}
                >
                  <Text style={[styles.chipText, filterTab === 'artists' && styles.chipTextActive]}>Nghệ sĩ</Text>
                </TouchableOpacity>
              </ScrollView>

              <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.addButtonText}>+ Tạo mới</Text>
              </TouchableOpacity>
            </View>
          )}

          {loading ? (
            <ActivityIndicator size="large" color="#1DB954" style={{ marginTop: 40 }} />
          ) : selectedPlaylistSongs ? (
            /* DANH SÁCH BÀI HÁT TRONG PLAYLIST HOẶC BÀI HÁT YÊU THÍCH */
            <FlatList
              data={selectedPlaylistSongs}
              keyExtractor={(item) => item.song_id.toString()}
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
              renderItem={({ item }) => (
                <SongItem song={item} onPress={handlePlaySong} style={{ marginBottom: 8 }} />
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Chưa có bài hát nào trong mục này</Text>
              }
            />
          ) : (
            /* TỔNG QUAN THƯ VIỆN: BÀI HÁT YÊU THÍCH + PLAYLISTS + NGHỆ SĨ */
            <ScrollView style={styles.scrollArea}>
              {/* 1. MỤC BÀI HÁT ĐÃ THÍCH (LIKED SONGS) */}
              {(filterTab === 'all' || filterTab === 'playlists') && (
                <TouchableOpacity style={styles.rowItem} onPress={openLikedSongs}>
                  <View style={styles.heartGradient}>
                    <Text style={{ fontSize: 22, color: '#FFF' }}>♥</Text>
                  </View>
                  <View style={styles.rowTextContainer}>
                    <Text style={styles.rowTitle}>Bài hát đã thích</Text>
                    <Text style={styles.rowSubtitle}>Danh sách phát • {likedCount} bài hát</Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* 2. DANH SÁCH PLAYLISTS CỦA USER */}
              {(filterTab === 'all' || filterTab === 'playlists') &&
                playlists.map((pl) => (
                  <TouchableOpacity key={pl.playlist_id} style={styles.rowItem} onPress={() => openPlaylist(pl)}>
                    <Image
                      source={{
                        uri: pl.cover_url || 'https://via.placeholder.com/100/1E293B/FFFFFF?text=Playlist',
                      }}
                      style={styles.playlistCover}
                    />
                    <View style={styles.rowTextContainer}>
                      <Text style={styles.rowTitle}>{pl.title}</Text>
                      <Text style={styles.rowSubtitle}>Danh sách phát • {pl.total_songs || 0} bài hát</Text>
                    </View>
                  </TouchableOpacity>
                ))}

              {/* 3. DANH SÁCH NGHỆ SĨ THEO DÕI */}
              {(filterTab === 'all' || filterTab === 'artists') &&
                artists.map((artist) => (
                  <TouchableOpacity key={artist.artist_id} style={styles.rowItem}>
                    <Image
                      source={{
                        uri: artist.avatar_url || 'https://via.placeholder.com/100/1E293B/FFFFFF?text=Artist',
                      }}
                      style={styles.artistAvatar}
                    />
                    <View style={styles.rowTextContainer}>
                      <Text style={styles.rowTitle}>{artist.name}</Text>
                      <Text style={styles.rowSubtitle}>Nghệ sĩ</Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          )}
        </View>

        {/* MODAL TẠO PLAYLIST MỚI */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Tạo Danh Sách Phát Mới</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Nhập tên playlist..."
                placeholderTextColor="#64748B"
                value={newPlaylistTitle}
                onChangeText={setNewPlaylistTitle}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={{ color: '#94A3B8' }}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.createBtn} onPress={handleCreatePlaylist}>
                  <Text style={{ color: '#0B1120', fontWeight: 'bold' }}>Tạo mới</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Footer actions={footerActions} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B1120' },
  container: { flex: 1 },
  content: { flex: 1 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menu: { flexDirection: 'row', alignItems: 'center' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    marginRight: 8,
  },
  chipActive: { backgroundColor: '#FFFFFF' },
  chipText: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#0B1120', fontWeight: '600' },
  addButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  scrollArea: { flex: 1, paddingHorizontal: 16 },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  heartGradient: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#4C1D95',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistCover: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  artistAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E293B',
  },
  rowTextContainer: { marginLeft: 14, flex: 1 },
  rowTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  rowSubtitle: { color: '#94A3B8', fontSize: 13, marginTop: 2 },
  emptyText: { color: '#64748B', textAlign: 'center', marginTop: 40 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  textInput: {
    backgroundColor: '#0B1120',
    color: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 20,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  cancelBtn: { paddingVertical: 8, paddingHorizontal: 16 },
  createBtn: { backgroundColor: '#1DB954', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
});
