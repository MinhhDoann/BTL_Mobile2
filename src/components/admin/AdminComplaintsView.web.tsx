import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { ComplaintItem } from '@/src/types/admin';
import { fetchAdminComplaints, updateComplaintStatus } from '@/src/lib/api/admin-api';
import { getCoverUrl } from '@/src/lib/cover-image';

export function AdminComplaintsView() {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchAdminComplaints();
      setComplaints(res.complaints || []);
    } catch (err) {
      console.error('Lỗi tải danh sách khiếu nại:', err);
      setNotice('Không thể tải danh sách khiếu nại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const handleAction = async (complaintId: number, status: 'accepted' | 'rejected') => {
    try {
      setUpdatingId(complaintId);
      const res = await updateComplaintStatus(complaintId, status);
      setNotice(res.message || (status === 'accepted' ? 'Đã tiếp nhận khiếu nại' : 'Đã từ chối khiếu nại'));
      setTimeout(() => setNotice(null), 3000);
      await loadComplaints();
    } catch (err: any) {
      setNotice(err.message || 'Thao tác thất bại.');
      setTimeout(() => setNotice(null), 3000);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (filter === 'pending') return c.status === 'pending';
    if (filter === 'accepted') return c.status === 'accepted';
    if (filter === 'rejected') return c.status === 'rejected';
    return true;
  });

  const formatDuration = (sec: number) => {
    if (!sec || sec <= 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const pendingCount = complaints.filter((c) => c.status === 'pending').length;
  const acceptedCount = complaints.filter((c) => c.status === 'accepted').length;
  const rejectedCount = complaints.filter((c) => c.status === 'rejected').length;

  if (loading && complaints.length === 0) {
    return (
      <View style={styles.centerWrap}>
        <ActivityIndicator size="large" color="#A78BFA" />
        <Text style={styles.loadingText}>Đang tải danh sách khiếu nại...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Notice bar */}
      {notice && (
        <View style={styles.noticeBanner}>
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      )}

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {[
          { key: 'all', label: 'Tất cả', count: complaints.length },
          { key: 'pending', label: 'Chờ xử lý', count: pendingCount },
          { key: 'accepted', label: 'Đã tiếp nhận', count: acceptedCount },
          { key: 'rejected', label: 'Đã từ chối', count: rejectedCount },
        ].map((tab) => {
          const isActive = filter === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setFilter(tab.key as any)}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
            >
              <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                {tab.label} ({tab.count})
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Complaint Items List */}
      {filteredComplaints.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>
            {filter === 'all'
              ? 'Chưa có khiếu nại nào trong hệ thống.'
              : `Không có khiếu nại nào thuộc trạng thái này.`}
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {filteredComplaints.map((item) => {
            const isPending = item.status === 'pending';
            const isAccepted = item.status === 'accepted';
            const isRejected = item.status === 'rejected';

            return (
              <View key={item.complaint_id} style={styles.card}>
                {/* Top Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.headerTitleWrap}>
                    <Text style={styles.complaintIdText}>#CMP-{item.complaint_id}</Text>
                    <Text style={styles.dateText}>
                      {new Date(item.created_at).toLocaleString('vi-VN')}
                    </Text>
                  </View>

                  {/* Status Badge */}
                  <View
                    style={[
                      styles.statusBadge,
                      isPending && styles.badgePending,
                      isAccepted && styles.badgeAccepted,
                      isRejected && styles.badgeRejected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        isPending && styles.textPending,
                        isAccepted && styles.textAccepted,
                        isRejected && styles.textRejected,
                      ]}
                    >
                      {isPending ? '⏳ Chờ xử lý' : isAccepted ? '✅ Đã tiếp nhận' : '❌ Đã từ chối'}
                    </Text>
                  </View>
                </View>

                {/* 4 Details Grid Section */}
                <View style={styles.gridContainer}>
                  {/* 1. Thông tin bài hát */}
                  <View style={styles.infoBox}>
                    <Text style={styles.boxTitle}>🎵 THÔNG TIN BÀI HÁT</Text>
                    <View style={styles.mediaRow}>
                      <Image
                        source={{ uri: getCoverUrl(item.song_cover) }}
                        style={styles.coverThumb}
                      />
                      <View style={styles.mediaMeta}>
                        <Text style={styles.songTitle} numberOfLines={2}>
                          {item.song_title}
                        </Text>
                        <Text style={styles.metaSub}>ID Bài hát: #{item.song_id}</Text>
                        <Text style={styles.metaSub}>
                          Thời lượng: {formatDuration(item.song_duration)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* 2. Thông tin nghệ sĩ */}
                  <View style={styles.infoBox}>
                    <Text style={styles.boxTitle}>🎤 THÔNG TIN NGHỆ SĨ</Text>
                    <View style={styles.mediaRow}>
                      <Image
                        source={{
                          uri: item.artist_avatar
                            ? getCoverUrl(item.artist_avatar)
                            : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200',
                        }}
                        style={styles.avatarThumb}
                      />
                      <View style={styles.mediaMeta}>
                        <Text style={styles.artistName} numberOfLines={1}>
                          {item.artist_name || 'Chưa cập nhật'}
                        </Text>
                        <Text style={styles.metaSub}>
                          {item.artist_bio
                            ? item.artist_bio.slice(0, 70) + (item.artist_bio.length > 70 ? '...' : '')
                            : 'Chưa có tiểu sử.'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* 3. Thông tin người khiếu nại */}
                  <View style={styles.infoBox}>
                    <Text style={styles.boxTitle}>👤 THÔNG TIN NGƯỜI KHIẾU NẠI</Text>
                    <View style={styles.userMeta}>
                      <Text style={styles.userName}>{item.complainant_name}</Text>
                      <Text style={styles.userEmail}>Email: {item.complainant_email}</Text>
                      <Text style={styles.metaSub}>User ID: #{item.complainant_id}</Text>
                    </View>
                  </View>

                  {/* 4. Nội dung khiếu nại */}
                  <View style={styles.infoBox}>
                    <Text style={styles.boxTitle}>🚨 NỘI DUNG KHIẾU NẠI</Text>
                    <View style={styles.reasonBadge}>
                      <Text style={styles.reasonBadgeText}>
                        Lý do: {item.reason_type}
                      </Text>
                    </View>
                    <Text style={styles.descText}>
                      {item.description || 'Không có mô tả chi tiết.'}
                    </Text>
                  </View>
                </View>

                {/* Bottom Action Row: Nút Tiếp nhận & Từ chối */}
                <View style={styles.actionRow}>
                  <Pressable
                    onPress={() => handleAction(item.complaint_id, 'accepted')}
                    disabled={updatingId === item.complaint_id || isAccepted}
                    style={[
                      styles.actionBtn,
                      styles.btnAccept,
                      (isAccepted || updatingId === item.complaint_id) && styles.btnDisabled,
                    ]}
                  >
                    {updatingId === item.complaint_id ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.btnTextAccept}>
                        {isAccepted ? '✓ Đã tiếp nhận' : '✓ Tiếp nhận'}
                      </Text>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={() => handleAction(item.complaint_id, 'rejected')}
                    disabled={updatingId === item.complaint_id || isRejected}
                    style={[
                      styles.actionBtn,
                      styles.btnReject,
                      (isRejected || updatingId === item.complaint_id) && styles.btnDisabled,
                    ]}
                  >
                    {updatingId === item.complaint_id ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.btnTextReject}>
                        {isRejected ? '✕ Đã từ chối' : '✕ Từ chối'}
                      </Text>
                    )}
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 8,
  },
  centerWrap: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 12,
    fontSize: 14,
  },
  noticeBanner: {
    backgroundColor: '#312E81',
    borderColor: '#6366F1',
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  noticeText: {
    color: '#E0E7FF',
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterTabActive: {
    backgroundColor: '#4338CA',
    borderColor: '#6366F1',
  },
  filterTabText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 13,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  emptyWrap: {
    padding: 48,
    backgroundColor: '#111827',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 15,
  },
  listContainer: {
    gap: 20,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  complaintIdText: {
    color: '#818CF8',
    fontWeight: '800',
    fontSize: 16,
  },
  dateText: {
    color: '#64748B',
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgePending: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  badgeAccepted: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  badgeRejected: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  textPending: { color: '#FBBF24' },
  textAccepted: { color: '#4ADE80' },
  textRejected: { color: '#F87171' },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  infoBox: {
    flex: 1,
    minWidth: 240,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  boxTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  mediaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coverThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#1E293B',
  },
  avatarThumb: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1E293B',
  },
  mediaMeta: {
    flex: 1,
  },
  songTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 2,
  },
  artistName: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 2,
  },
  metaSub: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 1,
  },
  userMeta: {
    gap: 3,
  },
  userName: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  userEmail: {
    color: '#38BDF8',
    fontSize: 13,
  },
  reasonBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  reasonBadgeText: {
    color: '#A5B4FC',
    fontWeight: '700',
    fontSize: 12,
  },
  descText: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 18,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  actionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 120,
  },
  btnAccept: {
    backgroundColor: '#22C55E',
  },
  btnReject: {
    backgroundColor: '#EF4444',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnTextAccept: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  btnTextReject: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
