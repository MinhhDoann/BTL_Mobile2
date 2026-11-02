import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProfileCard from '../components/ProfileCard';
import SettingSection from '../components/SettingSection';
import SettingItem from '../components/SettingItem';

export default function ProfileSettingsScreen() {
  const { width: windowWidth } = useWindowDimensions();

  // Chế độ mô phỏng kích thước: 'auto' | 'small' (375px) | 'large' (820px)
  // Giúp sinh viên và giảng viên dễ dàng kiểm tra & chụp ảnh 2 chế độ trực tiếp
  const [simulationMode, setSimulationMode] = useState('auto');

  // State các toggle settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);

  // Xác định độ rộng hiệu dụng
  const effectiveWidth =
    simulationMode === 'small'
      ? 375
      : simulationMode === 'large'
      ? 820
      : windowWidth;

  // Breakpoint cho màn hình lớn (Tablet / Phablet / Desktop): từ 680px trở lên
  const isLargeScreen = effectiveWidth >= 680;

  const handleAction = (title) => {
    const msg = `Bạn vừa chọn: "${title}"`;
    if (Platform.OS === 'web') {
      window.alert(msg);
    } else {
      Alert.alert('Cài đặt', msg);
    }
  };

  return (
    <View style={styles.mainWrapper}>
      {/* THANH ĐIỀU KHIỂN CHẾ ĐỘ RESPONSIVE (MÔ PHỎNG & CHỤP ẢNH) */}
      <View style={styles.responsiveToolbar}>
        <View style={styles.toolbarInfo}>
          <Ionicons
            name={isLargeScreen ? 'tablet-landscape-outline' : 'phone-portrait-outline'}
            size={18}
            color="#2563eb"
          />
          <Text style={styles.toolbarTitle}>
            {isLargeScreen ? 'Màn hình Lớn (Tablet/Wide)' : 'Màn hình Nhỏ (Mobile)'}
            <Text style={styles.toolbarSub}> ({Math.round(effectiveWidth)}px)</Text>
          </Text>
        </View>

        <View style={styles.modeButtonGroup}>
          <TouchableOpacity
            style={[
              styles.modeBtn,
              simulationMode === 'auto' && styles.modeBtnActive,
            ]}
            onPress={() => setSimulationMode('auto')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.modeBtnText,
                simulationMode === 'auto' && styles.modeBtnTextActive,
              ]}
            >
              Tự động
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeBtn,
              simulationMode === 'small' && styles.modeBtnActive,
            ]}
            onPress={() => setSimulationMode('small')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.modeBtnText,
                simulationMode === 'small' && styles.modeBtnTextActive,
              ]}
            >
              📱 Màn hình nhỏ (375px)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeBtn,
              simulationMode === 'large' && styles.modeBtnActive,
            ]}
            onPress={() => setSimulationMode('large')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.modeBtnText,
                simulationMode === 'large' && styles.modeBtnTextActive,
              ]}
            >
              💻 Màn hình lớn (820px)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* KHUNG HIỂN THỊ CHÍNH (ĐƯỢC ĐIỀU CHỈNH THEO KÍCH THƯỚC) */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          simulationMode !== 'auto' && {
            maxWidth: effectiveWidth,
            alignSelf: 'center',
            width: '100%',
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* TIÊU ĐỀ TRANG CÀI ĐẶT */}
        <View style={styles.screenHeader}>
          <Text style={styles.screenHeading}>Hồ Sơ & Cài Đặt</Text>
          <Text style={styles.screenSubheading}>
            Bố cục Flexbox chuẩn & Tự động thích ứng (Responsive)
          </Text>
        </View>

        {/* BỐ CỤC CHÍNH (FLEXBOX RESPONSIVE: ROW CHO MÀN LỚN, COLUMN CHO MÀN NHỎ) */}
        <View
          style={[
            styles.layoutContainer,
            isLargeScreen ? styles.layoutRow : styles.layoutColumn,
          ]}
        >
          {/* CỘT 1: PROFILE CARD */}
          <View
            style={[
              styles.profileColumn,
              isLargeScreen && styles.profileColumnLarge,
            ]}
          >
            <ProfileCard isLargeScreen={isLargeScreen} />

            {/* Thẻ ghi chú kỹ thuật Flexbox & Responsive */}
            <View style={styles.noteCard}>
              <View style={styles.noteHeader}>
                <Ionicons name="bulb-outline" size={16} color="#d97706" />
                <Text style={styles.noteTitle}>Nguyên tắc Responsive Flexbox</Text>
              </View>
              <Text style={styles.noteText}>
                • <Text style={styles.boldText}>Màn hình nhỏ:</Text> Xếp dọc (flexDirection: 'column'), thẻ Profile trải rộng 100% để hiển thị trực quan trên điện thoại.{'\n'}
                • <Text style={styles.boldText}>Màn hình lớn:</Text> Chuyển sang 2 cột ngang (flexDirection: 'row'), phân bổ Profile (40%) và Settings (60%) cân đối.
              </Text>
            </View>
          </View>

          {/* CỘT 2: SETTINGS LIST */}
          <View
            style={[
              styles.settingsColumn,
              isLargeScreen && styles.settingsColumnLarge,
            ]}
          >
            {/* NHÓM 1: CÀI ĐẶT TÀI KHOẢN */}
            <SettingSection title="Tài khoản & Bảo mật">
              <SettingItem
                icon="person-outline"
                iconBg="#eff6ff"
                iconColor="#2563eb"
                title="Thông tin tài khoản"
                subtitle="Chỉnh sửa email, số điện thoại, mật khẩu"
                type="link"
                onPress={() => handleAction('Thông tin tài khoản')}
              />
              <SettingItem
                icon="finger-print-outline"
                iconBg="#ecfdf5"
                iconColor="#059669"
                title="Xác thực sinh trắc học"
                subtitle="Dùng Face ID / Vân tay để mở khóa"
                type="switch"
                value={biometricsEnabled}
                onToggle={() => setBiometricsEnabled(!biometricsEnabled)}
              />
              <SettingItem
                icon="shield-checkmark-outline"
                iconBg="#fef2f2"
                iconColor="#dc2626"
                title="Bảo mật 2 lớp (2FA)"
                type="badge"
                badgeText="ĐÃ BẬT"
                onPress={() => handleAction('Bảo mật 2 lớp')}
                isLast={true}
              />
            </SettingSection>

            {/* NHÓM 2: TRẢI NGHIỆM & TÙY CHỈNH */}
            <SettingSection title="Trải nghiệm ứng dụng">
              <SettingItem
                icon="notifications-outline"
                iconBg="#fef3c7"
                iconColor="#d97706"
                title="Thông báo đẩy"
                subtitle="Tin tức mới, hoạt động tương tác"
                type="switch"
                value={notificationsEnabled}
                onToggle={() => setNotificationsEnabled(!notificationsEnabled)}
              />
              <SettingItem
                icon="moon-outline"
                iconBg="#f3e8ff"
                iconColor="#7c3aed"
                title="Chế độ nền tối (Dark mode)"
                subtitle="Giao diện tối màu bảo vệ mắt"
                type="switch"
                value={darkModeEnabled}
                onToggle={() => setDarkModeEnabled(!darkModeEnabled)}
              />
              <SettingItem
                icon="globe-outline"
                iconBg="#ecfeff"
                iconColor="#0891b2"
                title="Ngôn ngữ hiển thị"
                type="link"
                value="Tiếng Việt (VN)"
                onPress={() => handleAction('Ngôn ngữ hiển thị')}
              />
              <SettingItem
                icon="sync-outline"
                iconBg="#f0fdf4"
                iconColor="#16a34a"
                title="Tự động đồng bộ & Cập nhật"
                subtitle="Đồng bộ dữ liệu ngầm qua Wi-Fi"
                type="switch"
                value={autoUpdateEnabled}
                onToggle={() => setAutoUpdateEnabled(!autoUpdateEnabled)}
                isLast={true}
              />
            </SettingSection>

            {/* NHÓM 3: HỆ THỐNG & ĐĂNG XUẤT */}
            <SettingSection title="Hệ thống & Trợ giúp">
              <SettingItem
                icon="help-circle-outline"
                iconBg="#f1f5f9"
                iconColor="#475569"
                title="Trung tâm trợ giúp & FAQ"
                type="link"
                onPress={() => handleAction('Trung tâm trợ giúp')}
              />
              <SettingItem
                icon="information-circle-outline"
                iconBg="#f1f5f9"
                iconColor="#475569"
                title="Phiên bản phần mềm"
                type="link"
                value="v2.5.0 (Build 2026)"
                onPress={() => handleAction('Phiên bản')}
              />
              <SettingItem
                icon="log-out-outline"
                iconBg="#fee2e2"
                iconColor="#ef4444"
                title="Đăng xuất tài khoản"
                type="link"
                onPress={() => handleAction('Đăng xuất')}
                isLast={true}
              />
            </SettingSection>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  // Thanh công cụ Responsive mô phỏng
  responsiveToolbar: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  toolbarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toolbarTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  toolbarSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  modeButtonGroup: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 3,
    gap: 2,
  },
  modeBtn: {
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 6,
  },
  modeBtnActive: {
    backgroundColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  modeBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748b',
  },
  modeBtnTextActive: {
    color: '#ffffff',
  },

  // Vùng nội dung cuộn
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  screenHeader: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  screenHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.3,
  },
  screenSubheading: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 3,
  },

  // Bố cục Flexbox chính
  layoutContainer: {
    width: '100%',
  },
  layoutColumn: {
    flexDirection: 'column',
  },
  layoutRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
  },

  // Phân chia cột
  profileColumn: {
    width: '100%',
  },
  profileColumnLarge: {
    flex: 4.2, // Chiếm ~40-42% độ rộng trên màn hình lớn
  },
  settingsColumn: {
    width: '100%',
  },
  settingsColumnLarge: {
    flex: 5.8, // Chiếm ~58-60% độ rộng trên màn hình lớn
  },

  // Ghi chú lý thuyết
  noteCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fef3c7',
    padding: 12,
    marginTop: 12,
    marginBottom: 16,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  noteTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#92400e',
  },
  noteText: {
    fontSize: 11.5,
    color: '#78350f',
    lineHeight: 17,
  },
  boldText: {
    fontWeight: '700',
  },
});
