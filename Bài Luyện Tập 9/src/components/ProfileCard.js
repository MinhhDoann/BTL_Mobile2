import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileCard({ isLargeScreen = false }) {
  return (
    <View style={[styles.card, isLargeScreen && styles.cardLarge]}>
      {/* Background Banner */}
      <View style={styles.bannerBackground}>
        <View style={styles.bannerBadge}>
          <Ionicons name="sparkles" size={14} color="#f59e0b" />
          <Text style={styles.bannerBadgeText}>PRO Member</Text>
        </View>
      </View>

      {/* Main Profile Info */}
      <View style={[styles.profileBody, isLargeScreen && styles.profileBodyLarge]}>
        {/* Avatar Container */}
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
            }}
            style={styles.avatar}
          />
          <View style={styles.onlineStatus} />
        </View>

        {/* User Details */}
        <View style={[styles.detailsContainer, isLargeScreen && styles.detailsContainerLarge]}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>Nguyễn Minh Đoàn</Text>
            <Ionicons name="checkmark-circle" size={18} color="#2563eb" />
          </View>
          <Text style={styles.userRole}>Mobile Developer & UI Designer</Text>
          <Text style={styles.userEmail}>minhdoan.dev@example.com</Text>

          <Text style={styles.userBio}>
            Đam mê xây dựng ứng dụng di động React Native mượt mà, chuẩn Flexbox và responsive trên mọi thiết bị.
          </Text>
        </View>
      </View>

      {/* Stats Counter Row (Flexbox chuẩn) */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>48</Text>
          <Text style={styles.statLabel}>Dự án</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>2.4k</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>386</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
          <Ionicons name="create-outline" size={16} color="#ffffff" />
          <Text style={styles.editBtnText}>Chỉnh sửa hồ sơ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn} activeOpacity={0.8}>
          <Ionicons name="share-social-outline" size={18} color="#2563eb" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  cardLarge: {
    marginBottom: 0,
    flex: 1,
  },
  bannerBackground: {
    height: 80,
    backgroundColor: '#2563eb',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 12,
  },
  bannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  bannerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b45309',
  },
  profileBody: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -42,
  },
  profileBodyLarge: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3.5,
    borderColor: '#ffffff',
    backgroundColor: '#cbd5e1',
  },
  onlineStatus: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  detailsContainer: {
    alignItems: 'center',
    width: '100%',
  },
  detailsContainerLarge: {
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  userRole: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
    marginTop: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  userBio: {
    fontSize: 12.5,
    color: '#475569',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#f8fafc',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 10,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  editBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  shareBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
