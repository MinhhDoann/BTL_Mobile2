import { AppHeader } from '@/src/components/ui/app-header';
import { Footer } from '@/src/components/ui/footer';
import { PlayingTracker } from '@/src/components/ui/playing-tracker';
import { SongData, SongItem } from '@/src/components/ui/song-item';
import { API_BASE_URL } from '@/src/constants/api';
import { useFooterActions } from '@/src/constants/footer-actions';
import { usePlayer } from '@/src/context/player-context';
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

// Khởi tạo danh sách bài hát mặc định hiển thị lập tức
const INITIAL_SONGS: SongData[] = [
  {
    song_id: 1,
    title: 'Anh Là Ai',
    artist_name: 'Phương Ly',
    cover_url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=300&q=80',
    audio_url: 'https://github.com/MinhhDoann/BTL_Mobile2/raw/refs/heads/SongLink/nguoidautien_jukysan.mp3',
    duration: 210,
  },
  {
    song_id: 2,
    title: 'Rồi Ta Sẽ Ngắm Pháo Hoa Cùng Nhau',
    artist_name: 'Olew',
    cover_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80',
    audio_url: 'https://github.com/MinhhDoann/BTL_Mobile2/raw/refs/heads/SongLink/nguoidautien_emxinhsayhi.mp3',
    duration: 278,
  },
  {
    song_id: 3,
    title: 'Chúng Ta Của Hiện Tại',
    artist_name: 'Sơn Tùng M-TP',
    cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80',
    duration: 302,
  },
  {
    song_id: 4,
    title: 'Nấu Ăn Cho Em',
    artist_name: 'Đen Vâu',
    cover_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=300&q=80',
    duration: 245,
  },
  {
    song_id: 5,
    title: 'Dramatic',
    artist_name: 'Bích Phương',
    cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80',
    duration: 210,
  },
  {
    song_id: 6,
    title: 'Truyện Ngắn',
    artist_name: 'Hà Anh Tuấn',
    cover_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&q=80',
    duration: 250,
  },
];

export default function LibraryScreen() {
  const footerActions = useFooterActions('library');
  const { currentSong, playSong } = usePlayer();

  const [filterTab, setFilterTab] = useState<'all' | 'songs' | 'playlists' | 'artists'>('all');
  
  // State lưu danh sách bài hát từ CSDL MySQL (có sẵn dữ liệu khởi tạo)
  const [songs, setSongs] = useState<SongData[]>(INITIAL_SONGS);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [likedCount, setLikedCount] = useState<number>(INITIAL_SONGS.length);
  const [loading, setLoading] = useState<boolean>(false);

  // Xem chi tiết playlist hoặc Bài hát yêu thích
  const [selectedPlaylistSongs, setSelectedPlaylistSongs] = useState<SongData[] | null>(null);
  const [viewingTitle, setViewingTitle] = useState<string>('');

  // Modal tạo Playlist mới
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState<string>('');

  useEffect(() => {
    fetchLibraryData();
    fetchAllSongsFromMySQL();
  }, []);

  // 1. Lấy dữ liệu danh sách bài hát từ BE MySQL (/api/songs)
  const fetchAllSongsFromMySQL = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/songs`);
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setSongs(data);
      }
    } catch (error) {
      console.log('Đang dùng danh sách bài hát sẵn có:', error);
    }
  };

  // 2. Lấy dữ liệu tổng quan Thư viện từ BE MySQL (/api/library)
  const fetchLibraryData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/library`);
      const data = await response.json();
      if (data.playlists) setPlaylists(data.playlists);
      if (data.liked_songs_count) setLikedCount(data.liked_songs_count);
      if (data.followed_artists) setArtists(data.followed_artists);
    } catch (error) {
      console.log('Lỗi kết nối API thư viện:', error);
    }
  };

  // Mở danh sách bài hát đã thích
  const openLikedSongs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/library/favorites`);
      const data = await response.json();
      setSelectedPlaylistSongs(Array.isArray(data) && data.length > 0 ? data : songs);
      setViewingTitle('Bài Hát Đã Thích');
    } catch (error) {
      setSelectedPlaylistSongs(songs);
      setViewingTitle('Bài Hát Đã Thích');
    }
  };

  // Mở chi tiết 1 Playlist
  const openPlaylist = async (playlist: Playlist) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/library/playlist/${playlist.playlist_id}`);
      const data = await response.json();
      setSelectedPlaylistSongs(data.songs || []);
      setViewingTitle(playlist.title);
    } catch (error) {
      console.error('Lỗi lấy chi tiết playlist:', error);
    }
  };

  // Tạo playlist mới
  const handleCreatePlaylist = async () => {
    if (!newPlaylistTitle.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên playlist');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/library/playlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newPlaylistTitle }),
      });
      const data = await response.json();
      if (data.playlist_id) {
        Alert.alert('Thành công', `Đã tạo danh sách phát: ${newPlaylistTitle}`);
        setNewPlaylistTitle('');
        setModalVisible(false);
        fetchLibraryData();
      }
    } catch (error) {
      console.error('Lỗi tạo playlist:', error);
    }
  };

  // Kích hoạt phát bài hát khi chọn
  const handlePlaySong = (song: SongData) => {
    playSong(song, songs);
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
          {/* Thanh Filter Bar */}
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
                  onPress={() => setFilterTab('songs')}
                  style={[styles.chip, filterTab === 'songs' && styles.chipActive]}
                >
                  <Text style={[styles.chipText, filterTab === 'songs' && styles.chipTextActive]}>Bài hát</Text>
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
            /* CHI TIẾT PLAYLIST HOẶC BÀI HÁT ĐÃ THÍCH */
            <FlatList
              data={selectedPlaylistSongs}
              keyExtractor={(item) => item.song_id.toString()}
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
              renderItem={({ item }) => (
                <SongItem
                  song={item}
                  onPress={handlePlaySong}
                  isCurrentPlaying={currentSong?.song_id === item.song_id}
                  style={{ marginBottom: 8 }}
                />
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Chưa có bài hát nào trong mục này</Text>
              }
            />
          ) : (
            /* TỔNG QUAN THƯ VIỆN & COMPONENT BÀI HÁT TỪ MYSQL */
            <ScrollView style={styles.scrollArea}>
              {/* 1. SECTIONS BÀI HÁT (SONG ITEM COMPONENTS TỪ CSDL MYSQL) */}
              {(filterTab === 'all' || filterTab === 'songs') && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionHeaderTitle}>Danh Sách Bài Hát (Songs)</Text>
                  {songs.map((songItem) => (
                    <SongItem
                      key={songItem.song_id}
                      song={songItem}
                      onPress={handlePlaySong}
                      isCurrentPlaying={currentSong?.song_id === songItem.song_id}
                      style={{ marginBottom: 8 }}
                    />
                  ))}
                </View>
              )}

              {/* 2. MỤC BÀI HÁT ĐÃ THÍCH (LIKED SONGS) */}
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

              {/* 3. DANH SÁCH PLAYLISTS CỦA USER */}
              {(filterTab === 'all' || filterTab === 'playlists') &&
                playlists.map((pl) => (
                  <TouchableOpacity key={pl.playlist_id} style={styles.rowItem} onPress={() => openPlaylist(pl)}>
                    <Image
                      source={{
                        uri: pl.cover_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80',
                      }}
                      style={styles.playlistCover}
                    />
                    <View style={styles.rowTextContainer}>
                      <Text style={styles.rowTitle}>{pl.title}</Text>
                      <Text style={styles.rowSubtitle}>Danh sách phát • {pl.total_songs || 0} bài hát</Text>
                    </View>
                  </TouchableOpacity>
                ))}

              {/* 4. DANH SÁCH NGHỆ SĨ THEO DÕI */}
              {(filterTab === 'all' || filterTab === 'artists') &&
                artists.map((artist) => (
                  <TouchableOpacity key={artist.artist_id} style={styles.rowItem}>
                    <Image
                      source={{
                        uri: artist.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
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

        {/* ================= PLAYING TRACKING BAR Ở DƯỚI (ẢNH MẪU 2) ================= */}
        <PlayingTracker />

        {/* NAV FOOTER */}
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
  sectionContainer: {
    marginVertical: 12,
  },
  sectionHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  heartGradient: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#4C1D95',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistCover: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  artistAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1E293B',
  },
  rowTextContainer: { marginLeft: 14, flex: 1 },
  rowTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
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
