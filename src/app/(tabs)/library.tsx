import { LibraryItem, LibraryItemData } from '@/src/components/ui/library-item';
import { Footer } from '@/src/components/ui/footer';
import { useFooterActions } from '@/src/constants/footer-actions';
import { detectApiBase } from '@/src/lib/api/detectApi';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';



type FilterCategory = 'all' | 'playlist' | 'album' | 'artist';

export default function LibraryScreen() {
  const router = useRouter();
  const footerActions = useFooterActions('library');

  // Filter category state (Tất cả, Danh sách phát, Album, Nghệ sĩ - Đã loại bỏ Podcast)
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('all');
  
  // Layout mode state (dạng danh sách 'list' hoặc dạng lưới 'grid')
  const [layoutMode, setLayoutMode] = useState<'list' | 'grid'>('list');
  
  // Sort order ('recent' | 'name')
  const [sortOrder, setSortOrder] = useState<'recent' | 'name'>('recent');

  // Search query & toggle
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Items state
  const [items, setItems] = useState<LibraryItemData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Modal tạo playlist mới
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState<string>('');

  // Tải dữ liệu thư viện từ Backend API
  const fetchLibraryData = useCallback(async () => {
    try {
      setLoading(true);
      const base = await detectApiBase();
      const res = await fetch(`${base}/api/library`);
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data.items) ? data.items : []);
      } else {
        console.warn('[Library] API returned', res.status);
        setItems([]);
      }
    } catch (error) {
      console.log('[Library] API error:', error);
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLibraryData();
  }, [fetchLibraryData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLibraryData();
  };

  // Tạo danh sách phát mới (gọi API backend)
  const handleCreatePlaylist = useCallback(async () => {
    const title = newPlaylistTitle.trim();
    if (!title) return;

    setIsCreateModalOpen(false);
    setNewPlaylistTitle('');

    try {
      const base = await detectApiBase();
      // Tạo playlist cho user_id = 1 (admin mặc định) nếu chưa đăng nhập
      const res = await fetch(`${base}/api/playlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, user_id: 1, is_public: true }),
      });
      if (res.ok) {
        // Reload danh sách sau khi tạo thành công
        fetchLibraryData();
      } else {
        console.warn('[Library] Create playlist failed', res.status);
        // Thêm vào state ngay lập tức để UX mượt hơn
        const optimisticItem: LibraryItemData = {
          id: `local-${Date.now()}`,
          title,
          subtitle: 'Danh sách phát',
          type: 'playlist',
          cover_url: null,
        };
        setItems((prev) => [optimisticItem, ...prev]);
      }
    } catch {
      // Fallback: thêm optimistic nếu không có mạng
      const optimisticItem: LibraryItemData = {
        id: `local-${Date.now()}`,
        title,
        subtitle: 'Danh sách phát',
        type: 'playlist',
        cover_url: null,
      };
      setItems((prev) => [optimisticItem, ...prev]);
    }
  }, [newPlaylistTitle, fetchLibraryData]);

  // Lọc và Sắp xếp danh sách
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Lọc theo loại danh mục (Filter category)
    if (selectedFilter === 'playlist') {
      result = result.filter((i) => i.type === 'playlist' || i.type === 'single');
    } else if (selectedFilter === 'album') {
      result = result.filter((i) => i.type === 'album');
    } else if (selectedFilter === 'artist') {
      result = result.filter((i) => i.type === 'artist');
    }

    // Lọc theo từ khóa tìm kiếm
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(query) ||
          i.subtitle.toLowerCase().includes(query)
      );
    }

    // Sắp xếp
    if (sortOrder === 'name') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [items, selectedFilter, searchQuery, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'recent' ? 'name' : 'recent'));
  };

  const toggleLayoutMode = () => {
    setLayoutMode((prev) => (prev === 'list' ? 'grid' : 'list'));
  };

  const handlePressItem = (item: LibraryItemData) => {
    console.log('Pressed library item:', item.title);
    if (item.type === 'artist') {
      router.push({ pathname: '/search', params: { q: item.title } });
    } else {
      router.push({ pathname: '/search' });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* --- HEADER TRANG THƯ VIỆN --- */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* User Avatar */}
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
              }}
              style={styles.avatar}
            />
            <Text style={styles.headerTitle}>Thư viện</Text>
          </View>

          <View style={styles.headerRight}>
            {/* Search Icon */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setIsSearchVisible((prev) => !prev)}
            >
              <MaterialIcons name="search" size={26} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Plus Icon (Add Playlist) */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setIsCreateModalOpen(true)}
            >
              <MaterialIcons name="add" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Thanh Tìm Kiếm Inline khi bấm Search Icon */}
        {isSearchVisible && (
          <View style={styles.searchBarContainer}>
            <MaterialIcons name="search" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm trong Thư viện..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* --- THANH CHIP DANH MỤC (Đã loại bỏ Podcast) --- */}
        <View style={styles.chipsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScrollContent}
          >
            <TouchableOpacity
              style={[styles.chip, selectedFilter === 'all' && styles.chipActive]}
              onPress={() => setSelectedFilter('all')}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedFilter === 'all' && styles.chipTextActive,
                ]}
              >
                Tất cả
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.chip, selectedFilter === 'playlist' && styles.chipActive]}
              onPress={() => setSelectedFilter('playlist')}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedFilter === 'playlist' && styles.chipTextActive,
                ]}
              >
                Danh sách phát
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.chip, selectedFilter === 'album' && styles.chipActive]}
              onPress={() => setSelectedFilter('album')}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedFilter === 'album' && styles.chipTextActive,
                ]}
              >
                Album
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.chip, selectedFilter === 'artist' && styles.chipActive]}
              onPress={() => setSelectedFilter('artist')}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedFilter === 'artist' && styles.chipTextActive,
                ]}
              >
                Nghệ sĩ
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* --- THANH ĐIỀU KHIỂN SẮP XẾP & CHẾ ĐỘ HIỂN THỊ --- */}
        <View style={styles.controlBar}>
          {/* Nút Sắp xếp (↓↑ Gần đây / A-Z) */}
          <TouchableOpacity style={styles.sortButton} onPress={toggleSortOrder}>
            <MaterialIcons name="swap-vert" size={20} color="#FFFFFF" />
            <Text style={styles.sortText}>
              {sortOrder === 'recent' ? 'Gần đây' : 'Tên (A-Z)'}
            </Text>
          </TouchableOpacity>

          {/* Nút Toggle Layout (Danh sách / Lưới) */}
          <TouchableOpacity style={styles.layoutButton} onPress={toggleLayoutMode}>
            <MaterialIcons
              name={layoutMode === 'list' ? 'grid-view' : 'format-list-bulleted'}
              size={22}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* --- DANH SÁCH MỤC THƯ VIỆN --- */}
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            key={layoutMode} // Key đổi khi đổi layout để reset layout FlatList
            data={filteredAndSortedItems}
            numColumns={layoutMode === 'grid' ? 2 : 1}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <LibraryItem
                item={item}
                layout={layoutMode}
                onPress={handlePressItem}
              />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#FFFFFF"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="library-music" size={64} color="#1E293B" style={{ marginBottom: 16 }} />
                <Text style={styles.emptyTitle}>Thư viện trống</Text>
                <Text style={styles.emptyText}>
                  {searchQuery.trim()
                    ? 'Không tìm thấy kết quả phù hợp.'
                    : 'Nhấn dấu + để tạo danh sách phát đầu tiên của bạn.'}
                </Text>
              </View>
            }
          />
        )}

        {/* --- MODAL TẠO DANH SÁCH PHÁT MỚI --- */}
        <Modal
          visible={isCreateModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsCreateModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Tạo danh sách phát mới</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Tên danh sách phát..."
                placeholderTextColor="#94A3B8"
                value={newPlaylistTitle}
                onChangeText={setNewPlaylistTitle}
                autoFocus
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setIsCreateModalOpen(false)}
                >
                  <Text style={styles.modalCancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={handleCreatePlaylist}
                >
                  <Text style={styles.modalConfirmText}>Tạo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* --- FOOTER CHUNG --- */}
        <Footer actions={footerActions} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  container: {
    flex: 1,
  },
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },

  // Search input bar
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    padding: 0,
  },

  // Chips styles
  chipsContainer: {
    paddingVertical: 8,
  },
  chipsScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E293B',
  },
  chipActive: {
    backgroundColor: '#334155',
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Control bar (Sort & View Layout)
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 4,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sortText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  layoutButton: {
    padding: 4,
  },

  // List content styles
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  modalConfirmBtn: {
    backgroundColor: '#38BDF8',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  modalConfirmText: {
    color: '#0F172A',
    fontWeight: 'bold',
  },
});
