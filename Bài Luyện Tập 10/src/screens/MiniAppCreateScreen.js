import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { StorageService } from '../services/storage';

// Danh sách ảnh mẫu dự phòng khi chạy trên web hoặc môi trường hạn chế quyền camera/media
const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80',
];

export default function MiniAppCreateScreen({ onNavigateToSaved }) {
  const [userName, setUserName] = useState('Nguyễn Minh Đoàn');
  const [noteTitle, setNoteTitle] = useState('Chuyến du lịch khám phá Đà Nẵng');
  const [noteContent, setNoteContent] = useState(
    'Một ngày trải nghiệm thật tuyệt vời tại bãi biển Mỹ Khê và bán đảo Sơn Trà. Thời tiết trong lành, cảnh đẹp và hải sản rất tươi ngon!'
  );
  const [selectedImage, setSelectedImage] = useState(SAMPLE_IMAGES[0]);
  const [locationData, setLocationData] = useState({
    coords: '16.0544° N, 108.2022° E',
    address: 'Bãi biển Mỹ Khê, Quận Sơn Trà, TP. Đà Nẵng',
    timestamp: 'Vừa xong',
  });
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successBanner, setSuccessBanner] = useState(null);

  // 1. CHỨC NĂNG CHỌN ẢNH (IMAGE PICKER)
  const handlePickImage = async () => {
    try {
      // Yêu cầu quyền truy cập thư viện ảnh
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted && Platform.OS !== 'web') {
        Alert.alert(
          'Yêu cầu quyền truy cập',
          'Bạn cần cấp quyền truy cập thư viện ảnh để tiếp tục. Ứng dụng sẽ sử dụng ảnh mẫu chất lượng cao thay thế.'
        );
        cycleSampleImage();
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
        setSuccessBanner('Đã chọn ảnh thành công từ thiết bị!');
      }
    } catch (error) {
      console.warn('Lỗi khi mở thư viện ảnh, chuyển sang ảnh mẫu:', error);
      cycleSampleImage();
    }
  };

  // Chọn ảnh mẫu nhanh
  const cycleSampleImage = () => {
    const currentIndex = SAMPLE_IMAGES.indexOf(selectedImage);
    const nextIndex = (currentIndex + 1) % SAMPLE_IMAGES.length;
    setSelectedImage(SAMPLE_IMAGES[nextIndex]);
    setSuccessBanner('Đã đổi sang ảnh mẫu đẹp có sẵn!');
  };

  // 2. CHỨC NĂNG LẤY VỊ TRÍ HIỆN TẠI (GEOLOCATION)
  const handleGetLocation = async () => {
    setIsLocating(true);
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude.toFixed(4);
            const lng = pos.coords.longitude.toFixed(4);
            setLocationData({
              coords: `${lat}° N, ${lng}° E`,
              address: 'Tọa độ GPS thiết bị hiện tại',
              timestamp: new Date().toLocaleTimeString('vi-VN'),
            });
            setIsLocating(false);
            setSuccessBanner('Đã lấy tọa độ vị trí GPS hiện tại!');
          },
          (err) => {
            console.warn('Lỗi Geolocation Web, dùng tọa độ dự phòng:', err);
            setDefaultLocation();
          },
          { timeout: 8000 }
        );
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập vị trí', 'Quyền truy cập bị từ chối. Sử dụng vị trí mẫu.');
        setDefaultLocation();
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const lat = location.coords.latitude.toFixed(4);
      const lng = location.coords.longitude.toFixed(4);
      setLocationData({
        coords: `${lat}° N, ${lng}° E`,
        address: 'Tọa độ GPS ghi nhận thành công',
        timestamp: new Date().toLocaleTimeString('vi-VN'),
      });
      setSuccessBanner('Đã lấy vị trí GPS thành công!');
    } catch (error) {
      console.warn('Lỗi Location:', error);
      setDefaultLocation();
    } finally {
      setIsLocating(false);
    }
  };

  const setDefaultLocation = () => {
    setLocationData({
      coords: '21.0285° N, 105.8542° E',
      address: 'Học viện Công nghệ Bưu chính Viễn thông (PTIT), Hà Nội',
      timestamp: new Date().toLocaleTimeString('vi-VN'),
    });
    setIsLocating(false);
    setSuccessBanner('Đã ghi nhận vị trí cơ sở học tập!');
  };

  // 3. CHỨC NĂNG LƯU VÀO ASYNCSTORAGE
  const handleSaveToAsyncStorage = async () => {
    if (!userName.trim() || !noteTitle.trim()) {
      const msg = 'Vui lòng nhập đầy đủ Tên người dùng và Tiêu đề ghi chú!';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Thiếu thông tin', msg);
      }
      return;
    }

    setIsSaving(true);
    try {
      const newEntry = {
        id: Date.now().toString(),
        userName: userName.trim(),
        title: noteTitle.trim(),
        content: noteContent.trim(),
        imageUri: selectedImage,
        location: locationData,
        savedAt: new Date().toLocaleString('vi-VN'),
      };

      await StorageService.saveEntry(newEntry);

      const msg = 'Đã lưu thông tin thành công vào AsyncStorage!';
      setSuccessBanner(msg);

      if (Platform.OS !== 'web') {
        Alert.alert('Thành công', msg, [
          { text: 'Ở lại', style: 'cancel' },
          { text: 'Xem dữ liệu đã lưu', onPress: onNavigateToSaved },
        ]);
      }
    } catch (e) {
      const err = 'Không thể lưu vào AsyncStorage: ' + e.message;
      setSuccessBanner(err);
      if (Platform.OS !== 'web') {
        Alert.alert('Lỗi', err);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.containerCard}>
        {/* TIÊU ĐỀ KHỐI TẠO BẢN GHI */}
        <View style={styles.cardHeader}>
          <View style={styles.headerIconCircle}>
            <Ionicons name="create-outline" size={24} color="#2563eb" />
          </View>
          <View style={styles.headerTextBox}>
            <Text style={styles.cardHeading}>Tạo Bản Ghi & Lưu AsyncStorage</Text>
            <Text style={styles.cardSub}>
              Tích hợp Chọn ảnh (Image Picker) + Lấy vị trí (Geolocation)
            </Text>
          </View>
        </View>

        {/* THÔNG BÁO THÀNH CÔNG / PHẢN HỒI */}
        {successBanner && (
          <View style={styles.bannerBox}>
            <Ionicons name="checkmark-circle" size={18} color="#15803d" />
            <Text style={styles.bannerText}>{successBanner}</Text>
            <TouchableOpacity onPress={() => setSuccessBanner(null)}>
              <Ionicons name="close" size={16} color="#15803d" />
            </TouchableOpacity>
          </View>
        )}

        {/* 1. KHỐI NHẬP THÔNG TIN (TÊN NGƯỜI DÙNG & TIÊU ĐỀ) */}
        <View style={styles.formGroup}>
          <Text style={styles.fieldLabel}>Tên người dùng / Tác giả *</Text>
          <View style={styles.inputBox}>
            <Ionicons name="person-outline" size={18} color="#64748b" style={styles.fieldIcon} />
            <TextInput
              style={styles.textInput}
              value={userName}
              onChangeText={setUserName}
              placeholder="Nhập tên người dùng..."
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.fieldLabel}>Tiêu đề ghi chú / Nhật ký *</Text>
          <View style={styles.inputBox}>
            <Ionicons name="document-text-outline" size={18} color="#64748b" style={styles.fieldIcon} />
            <TextInput
              style={styles.textInput}
              value={noteTitle}
              onChangeText={setNoteTitle}
              placeholder="Nhập tiêu đề nhật ký..."
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.fieldLabel}>Nội dung chi tiết</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={noteContent}
            onChangeText={setNoteContent}
            placeholder="Ghi lại suy nghĩ hoặc ghi chú của bạn..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* 2. CHỌN ẢNH (IMAGE PICKER) */}
        <View style={styles.sectionDivider} />
        <View style={styles.featureHeader}>
          <Ionicons name="image-outline" size={20} color="#2563eb" />
          <Text style={styles.featureTitle}>Hình ảnh đính kèm (Image Picker)</Text>
        </View>

        <View style={styles.imagePickerCard}>
          {selectedImage ? (
            <View style={styles.imagePreviewWrapper}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              <View style={styles.imageOverlayBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#ffffff" />
                <Text style={styles.imageBadgeText}>Ảnh đã sẵn sàng</Text>
              </View>
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="images-outline" size={42} color="#94a3b8" />
              <Text style={styles.placeholderText}>Chưa chọn hình ảnh nào</Text>
            </View>
          )}

          <View style={styles.imageButtonsRow}>
            <TouchableOpacity
              style={styles.pickImageBtn}
              onPress={handlePickImage}
              activeOpacity={0.8}
            >
              <Ionicons name="camera-outline" size={17} color="#ffffff" />
              <Text style={styles.pickImageBtnText}>Chọn ảnh thiết bị</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sampleImageBtn}
              onPress={cycleSampleImage}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-outline" size={16} color="#2563eb" />
              <Text style={styles.sampleImageBtnText}>Đổi ảnh mẫu</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. LẤY VỊ TRÍ (GEOLOCATION) */}
        <View style={styles.sectionDivider} />
        <View style={styles.featureHeader}>
          <Ionicons name="location-outline" size={20} color="#059669" />
          <Text style={styles.featureTitle}>Tọa độ vị trí (Geolocation)</Text>
        </View>

        <View style={styles.locationCard}>
          <View style={styles.locationInfoRow}>
            <View style={styles.locationPinBox}>
              <Ionicons name="navigate-circle" size={28} color="#059669" />
            </View>
            <View style={styles.locationTextWrapper}>
              <Text style={styles.locationCoordsText}>{locationData.coords}</Text>
              <Text style={styles.locationAddressText}>{locationData.address}</Text>
              <Text style={styles.locationTimeText}>Cập nhật: {locationData.timestamp}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.locationBtn}
            onPress={handleGetLocation}
            disabled={isLocating}
            activeOpacity={0.8}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color="#059669" />
            ) : (
              <>
                <Ionicons name="locate" size={16} color="#059669" />
                <Text style={styles.locationBtnText}>Lấy tọa độ GPS mới</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* 4. NÚT LƯU VÀO ASYNCSTORAGE */}
        <View style={styles.sectionDivider} />
        <TouchableOpacity
          style={styles.saveSubmitBtn}
          onPress={handleSaveToAsyncStorage}
          disabled={isSaving}
          activeOpacity={0.85}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#ffffff" />
              <Text style={styles.saveSubmitText}>Lưu Bản Ghi Vào AsyncStorage</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Nút xem dữ liệu đã lưu */}
        <TouchableOpacity
          style={styles.viewSavedDataBtn}
          onPress={onNavigateToSaved}
          activeOpacity={0.7}
        >
          <Ionicons name="folder-open-outline" size={18} color="#2563eb" />
          <Text style={styles.viewSavedDataText}>Đến Màn Hình "Saved Data" (Đọc Dữ Liệu)</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  containerCard: {
    width: '100%',
    maxWidth: 620,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  headerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  headerTextBox: {
    flex: 1,
  },
  cardHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  cardSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  bannerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  bannerText: {
    flex: 1,
    fontSize: 12.5,
    color: '#166534',
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 4,
  },
  fieldIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    paddingVertical: 6,
  },
  textArea: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 12,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 16,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  imagePickerCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
  },
  imagePreviewWrapper: {
    position: 'relative',
    width: '100%',
    height: 180,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlayBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  imageBadgeText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
  },
  imagePlaceholder: {
    height: 120,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 12.5,
    color: '#94a3b8',
    marginTop: 6,
  },
  imageButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pickImageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  pickImageBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  sampleImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 6,
  },
  sampleImageBtnText: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '600',
  },
  locationCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    padding: 14,
  },
  locationInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  locationPinBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationTextWrapper: {
    flex: 1,
  },
  locationCoordsText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#166534',
  },
  locationAddressText: {
    fontSize: 12,
    color: '#15803d',
    marginTop: 2,
  },
  locationTimeText: {
    fontSize: 11,
    color: '#65a30d',
    marginTop: 2,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#86efac',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  locationBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#059669',
  },
  saveSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  saveSubmitText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  viewSavedDataBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 10,
    gap: 6,
  },
  viewSavedDataText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
});
