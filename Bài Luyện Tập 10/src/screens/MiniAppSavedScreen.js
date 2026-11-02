import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StorageService } from '../services/storage';

export default function MiniAppSavedScreen({ onNavigateToCreate }) {
  const [savedEntries, setSavedEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Đọc dữ liệu từ AsyncStorage
  const loadSavedData = async () => {
    setLoading(true);
    try {
      const data = await StorageService.getSavedEntries();
      setSavedEntries(data);
    } catch (e) {
      console.error('Lỗi khi đọc AsyncStorage:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedData();
  }, []);

  // Xóa một bản ghi
  const handleDeleteEntry = async (id, title) => {
    const confirmDelete = async () => {
      try {
        const updated = await StorageService.deleteEntry(id);
        setSavedEntries(updated);
      } catch (e) {
        console.error('Lỗi khi xóa:', e);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Bạn có chắc muốn xóa bản ghi "${title}" khỏi AsyncStorage?`)) {
        confirmDelete();
      }
    } else {
      Alert.alert('Xác nhận xóa', `Bạn có chắc muốn xóa bản ghi "${title}"?`, [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa ngay', style: 'destructive', onPress: confirmDelete },
      ]);
    }
  };

  // Xóa tất cả dữ liệu trong AsyncStorage
  const handleClearAll = async () => {
    const doClear = async () => {
      try {
        await StorageService.clearAllEntries();
        setSavedEntries([]);
      } catch (e) {
        console.error('Lỗi dọn dẹp:', e);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Bạn có chắc muốn xóa toàn bộ dữ liệu trong AsyncStorage?')) {
        doClear();
      }
    } else {
      Alert.alert(
        'Xóa toàn bộ',
        'Thao tác này sẽ xóa sạch tất cả bản ghi đã lưu trong AsyncStorage.',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Xóa sạch', style: 'destructive', onPress: doClear },
        ]
      );
    }
  };

  // Thêm dữ liệu mẫu nhanh nếu trống
  const handleSeedDemoData = async () => {
    const demoEntry = {
      id: Date.now().toString(),
      userName: 'Nguyễn Minh Đoàn',
      title: 'Hồ Hoàn Kiếm ngày thu Hà Nội',
      content: 'Không khí se lạnh đặc trưng của mùa thu Hà Nội quanh phố đi bộ Hồ Gươm.',
      imageUri: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&auto=format&fit=crop&q=80',
      location: {
        coords: '21.0285° N, 105.8542° E',
        address: 'Hồ Hoàn Kiếm, Quận Hoàn Kiếm, TP. Hà Nội',
        timestamp: 'Hôm nay',
      },
      savedAt: new Date().toLocaleString('vi-VN'),
    };
    await StorageService.saveEntry(demoEntry);
    loadSavedData();
  };

  const renderSavedItem = ({ item, index }) => (
    <View style={styles.entryCard}>
      {/* Ảnh đã lưu */}
      {item.imageUri ? (
        <View style={styles.cardImageWrapper}>
          <Image source={{ uri: item.imageUri }} style={styles.cardImage} />
          <View style={styles.storageTag}>
            <Ionicons name="hardware-chip-outline" size={12} color="#ffffff" />
            <Text style={styles.storageTagText}>AsyncStorage</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.cardContent}>
        {/* Tiêu đề & nút xóa */}
        <View style={styles.titleRow}>
          <Text style={styles.entryTitle}>{item.title}</Text>
          <TouchableOpacity
            style={styles.deleteIconBtn}
            onPress={() => handleDeleteEntry(item.id, item.title)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Người đăng & Thời gian lưu */}
        <View style={styles.metaRow}>
          <View style={styles.authorBadge}>
            <Ionicons name="person" size={13} color="#2563eb" />
            <Text style={styles.authorText}>{item.userName}</Text>
          </View>
          <Text style={styles.savedTimeText}>🕒 {item.savedAt}</Text>
        </View>

        {/* Nội dung ghi chú */}
        <Text style={styles.entryDescription}>{item.content}</Text>

        {/* Khối vị trí đã lưu */}
        {item.location && (
          <View style={styles.locationBadgeBox}>
            <Ionicons name="location" size={15} color="#059669" />
            <View style={styles.locationTexts}>
              <Text style={styles.locationCoordsLabel}>{item.location.coords}</Text>
              <Text style={styles.locationAddressLabel}>{item.location.address}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* THANH THỐNG KÊ & NÚT ĐIỀU KHIỂN */}
      <View style={styles.topBar}>
        <View style={styles.statsInfo}>
          <Text style={styles.topBarTitle}>Dữ Liệu Đã Lưu (Saved Data)</Text>
          <Text style={styles.topBarSub}>
            Tổng số bản ghi trong AsyncStorage: <Text style={styles.bold}>{savedEntries.length}</Text>
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={loadSavedData}
            activeOpacity={0.7}
          >
            <Ionicons name="reload" size={16} color="#2563eb" />
          </TouchableOpacity>

          {savedEntries.length > 0 && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={handleClearAll}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-bin-outline" size={15} color="#dc2626" />
              <Text style={styles.clearBtnText}>Xóa tất cả</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* DANH SÁCH BẢN GHI ĐÃ LƯU */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Đang đọc dữ liệu từ AsyncStorage...</Text>
        </View>
      ) : (
        <FlatList
          data={savedEntries}
          renderItem={renderSavedItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="file-tray-outline" size={48} color="#94a3b8" />
              </View>
              <Text style={styles.emptyTitle}>Chưa có bản ghi nào trong AsyncStorage</Text>
              <Text style={styles.emptySub}>
                Hãy qua màn hình Tạo bài viết để chọn ảnh, lấy vị trí và lưu bản ghi đầu tiên!
              </Text>

              <View style={styles.emptyActions}>
                <TouchableOpacity
                  style={styles.createNowBtn}
                  onPress={onNavigateToCreate}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add-circle-outline" size={18} color="#ffffff" />
                  <Text style={styles.createNowBtnText}>Tạo bản ghi mới ngay</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.seedDemoBtn}
                  onPress={handleSeedDemoData}
                  activeOpacity={0.8}
                >
                  <Ionicons name="sparkles-outline" size={16} color="#2563eb" />
                  <Text style={styles.seedDemoBtnText}>Nạp dữ liệu mẫu</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topBar: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  statsInfo: {
    flex: 1,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  topBarSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  bold: {
    fontWeight: '700',
    color: '#2563eb',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  entryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImageWrapper: {
    position: 'relative',
    width: '100%',
    height: 190,
    backgroundColor: '#f1f5f9',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  storageTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  storageTagText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '700',
  },
  cardContent: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  entryTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginRight: 8,
  },
  deleteIconBtn: {
    padding: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  authorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  authorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  savedTimeText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  entryDescription: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
  },
  locationBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    padding: 10,
    borderRadius: 10,
    gap: 8,
  },
  locationTexts: {
    flex: 1,
  },
  locationCoordsLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#166534',
  },
  locationAddressLabel: {
    fontSize: 11.5,
    color: '#15803d',
    marginTop: 1,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 12,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    maxWidth: 320,
  },
  emptyActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  createNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  createNowBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  seedDemoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  seedDemoBtnText: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '600',
  },
});
