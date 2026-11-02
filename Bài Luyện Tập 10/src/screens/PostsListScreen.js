import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'https://jsonplaceholder.typicode.com/posts';

export default function PostsListScreen() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [simulateError, setSimulateError] = useState(false);

  // Hàm gọi API lấy danh sách bài viết từ JSONPlaceholder
  const fetchPosts = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMessage(null);

    try {
      // Mô phỏng trường hợp mạng có vấn đề nếu bật cờ simulateError
      if (simulateError) {
        throw new Error('Mô phỏng lỗi: Không thể kết nối tới máy chủ JSONPlaceholder (HTTP 500 / Network Error)');
      }

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Máy chủ phản hồi với mã lỗi: ${response.status} (${response.statusText})`);
      }

      const data = await response.json();
      setPosts(data);
      setFilteredPosts(data);
    } catch (error) {
      console.error('Lỗi khi fetch posts:', error);
      setErrorMessage(error.message || 'Đã xảy ra lỗi không xác định khi gọi API.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [simulateError]);

  // Tìm kiếm bài viết theo tiêu đề
  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredPosts(posts);
      return;
    }
    const filtered = posts.filter(
      (item) =>
        item.title.toLowerCase().includes(text.toLowerCase()) ||
        item.body.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredPosts(filtered);
  };

  // Render từng bài viết trong FlatList
  const renderPostItem = ({ item, index }) => (
    <View style={styles.postCard}>
      {/* Header của bài viết: ID & Badge */}
      <View style={styles.postHeader}>
        <View style={styles.badgeId}>
          <Text style={styles.badgeIdText}>#{item.id}</Text>
        </View>
        <View style={styles.userBadge}>
          <Ionicons name="person-circle-outline" size={14} color="#64748b" />
          <Text style={styles.userBadgeText}>User ID: {item.userId}</Text>
        </View>
        <Text style={styles.postTimeText}>Bài viết #{index + 1}</Text>
      </View>

      {/* Tiêu đề bài viết (tối thiểu theo yêu cầu) */}
      <Text style={styles.postTitle} numberOfLines={2}>
        {item.title}
      </Text>

      {/* Nội dung tóm tắt bài viết (tối thiểu theo yêu cầu) */}
      <Text style={styles.postBody} numberOfLines={3}>
        {item.body.replace(/\n/g, ' ')}
      </Text>

      {/* Footer tương tác */}
      <View style={styles.postFooter}>
        <View style={styles.interactionItem}>
          <Ionicons name="heart-outline" size={16} color="#ef4444" />
          <Text style={styles.interactionText}>{item.id * 3 + 7}</Text>
        </View>
        <View style={styles.interactionItem}>
          <Ionicons name="chatbubble-ellipses-outline" size={15} color="#2563eb" />
          <Text style={styles.interactionText}>5 bình luận</Text>
        </View>
        <TouchableOpacity style={styles.readMoreBtn} activeOpacity={0.7}>
          <Text style={styles.readMoreText}>Đọc tiếp</Text>
          <Ionicons name="chevron-forward" size={14} color="#2563eb" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* THANH ĐIỀU KHIỂN & TÌM KIẾM */}
      <View style={styles.topControlBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tiêu đề hoặc nội dung..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Nút giả lập chuyển đổi trạng thái lỗi */}
        <View style={styles.toggleRow}>
          <Text style={styles.statsCount}>
            Hiển thị: <Text style={styles.boldText}>{filteredPosts.length}</Text> / {posts.length} bài
          </Text>

          <TouchableOpacity
            style={[styles.simulateBtn, simulateError && styles.simulateBtnActive]}
            onPress={() => setSimulateError(!simulateError)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={simulateError ? 'bug' : 'bug-outline'}
              size={14}
              color={simulateError ? '#ffffff' : '#b91c1c'}
            />
            <Text
              style={[
                styles.simulateBtnText,
                simulateError && styles.simulateBtnTextActive,
              ]}
            >
              {simulateError ? 'Tắt lỗi (Thường)' : 'Mô phỏng lỗi API'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* XỬ LÝ CÁC TRẠNG THÁI: LOADING, ERROR, SUCCESS */}
      {loading ? (
        // 1. TRẠNG THÁI ĐANG TẢI (LOADING)
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingTitle}>Đang tải dữ liệu từ API...</Text>
          <Text style={styles.loadingSubtitle}>
            Đang kết nối: https://jsonplaceholder.typicode.com/posts
          </Text>
        </View>
      ) : errorMessage ? (
        // 2. TRẠNG THÁI BỊ LỖI (ERROR)
        <View style={styles.centerContainer}>
          <View style={styles.errorIconCircle}>
            <Ionicons name="cloud-offline-outline" size={48} color="#dc2626" />
          </View>
          <Text style={styles.errorHeading}>Không thể tải bài viết!</Text>
          <Text style={styles.errorMessageText}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setSimulateError(false);
              fetchPosts();
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={18} color="#ffffff" />
            <Text style={styles.retryButtonText}>Thử lại ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // 3. TRẠNG THÁI HIỂN THỊ DỮ LIỆU THÀNH CÔNG (FLATLIST)
        <FlatList
          data={filteredPosts}
          renderItem={renderPostItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchPosts(true)}
              colors={['#2563eb']}
              tintColor="#2563eb"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyText}>Không tìm thấy bài viết nào phù hợp.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topControlBar: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 4,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    paddingVertical: 6,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsCount: {
    fontSize: 12.5,
    color: '#64748b',
  },
  boldText: {
    fontWeight: '700',
    color: '#0f172a',
  },
  simulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fca5a5',
    gap: 4,
  },
  simulateBtnActive: {
    backgroundColor: '#dc2626',
    borderColor: '#b91c1c',
  },
  simulateBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#b91c1c',
  },
  simulateBtnTextActive: {
    color: '#ffffff',
  },

  // Danh sách FlatList
  listContainer: {
    padding: 16,
    paddingBottom: 32,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  postCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  badgeId: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  badgeIdText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userBadgeText: {
    fontSize: 11.5,
    color: '#64748b',
    fontWeight: '500',
  },
  postTimeText: {
    fontSize: 11,
    color: '#94a3b8',
    marginLeft: 'auto',
  },
  postTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
    lineHeight: 22,
    textTransform: 'capitalize',
  },
  postBody: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 16,
  },
  interactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  interactionText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 2,
  },
  readMoreText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#2563eb',
  },

  // Trạng thái Trung tâm
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
  },
  loadingSubtitle: {
    fontSize: 12.5,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  errorIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#991b1b',
    marginBottom: 8,
  },
  errorMessageText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
    maxWidth: 360,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 6,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 10,
  },
});
