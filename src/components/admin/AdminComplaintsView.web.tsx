import { fetchAdminComplaints, updateComplaintStatus } from '@/src/lib/api/admin-api';
import { getCoverUrl } from '@/src/lib/cover-image';
import { ComplaintItem } from '@/src/types/admin';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export function AdminComplaintsView() {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Modal xác nhận tiếp nhận / từ chối
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    complaintId: number | null;
    status: 'accepted' | 'rejected' | null;
    songTitle: string;
  }>({
    visible: false,
    complaintId: null,
    status: null,
    songTitle: '',
  });

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

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <Pressable
                    disabled={updatingId === item.complaint_id || isAccepted}
                    onPress={() =>
                      setConfirmModal({
                        visible: true,
                        complaintId: item.complaint_id,
                        status: 'accepted',
                        songTitle: item.song_title,
                      })
                    }
                    style={[
                      styles.actionBtn,
                      styles.btnAccept,
                      (updatingId === item.complaint_id || isAccepted) && styles.btnDisabled,
                    ]}
                  >
                    <Text style={styles.btnTextAccept}>
                      {isAccepted ? '✓ Đã tiếp nhận' : 'Tiếp nhận'}
                    </Text>
                  </Pressable>

                  <Pressable
                    disabled={updatingId === item.complaint_id || isRejected}
                    onPress={() =>
                      setConfirmModal({
                        visible: true,
                        complaintId: item.complaint_id,
                        status: 'rejected',
                        songTitle: item.song_title,
                      })
                    }
                    style={[
                      styles.actionBtn,
                      styles.btnReject,
                      (updatingId === item.complaint_id || isRejected) && styles.btnDisabled,
                    ]}
                  >
                    <Text style={styles.btnTextReject}>
                      {isRejected ? '✓ Đã từ chối' : 'Từ chối'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* MODAL XÁC NHẬN TIẾP NHẬN / TỪ CHỐI KHIẾU NẠI */}
      <Modal
        visible={confirmModal.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setConfirmModal((prev) => ({ ...prev, visible: false }))}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {confirmModal.status === 'accepted'
                  ? '⚠️ XÁC NHẬN TIẾP NHẬN KHIẾU NẠI'
                  : '❌ XÁC NHẬN TỪ CHỐI KHIẾU NẠI'}
              </Text>
              <Pressable onPress={() => setConfirmModal((prev) => ({ ...prev, visible: false }))}>
                <Ionicons name="close" size={24} color="#94A3B8" />
              </Pressable>
            </View>

            {confirmModal.status === 'accepted' ? (
              <View style={{ marginVertical: 12 }}>
                <Text style={styles.modalMessage}>
                  Bạn có chắc chắn muốn <Text style={{ color: '#10B981', fontWeight: 'bold' }}>TIẾP NHẬN</Text> khiếu nại này đối với bài hát <Text style={{ color: '#F8FAFC', fontWeight: 'bold' }}>"{confirmModal.songTitle}"</Text>?
                </Text>

                <View style={styles.infoAlertBox}>
                  <Text style={styles.infoAlertTitle}>ℹ️ Quản lý Bài hát:</Text>
                  <Text style={styles.infoAlertText}>
                    • Sau khi xác nhận tiếp nhận khiếu nại, Admin có thể chuyển sang mục <Text style={{ color: '#38BDF8', fontWeight: 'bold' }}>Quản lý Bài hát</Text> để chủ động xóa bài hát thủ công nếu cần.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={{ marginVertical: 12 }}>
                <Text style={styles.modalMessage}>
                  Bạn có chắc chắn muốn <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>TỪ CHỐI</Text> khiếu nại đối với bài hát <Text style={{ color: '#F8FAFC', fontWeight: 'bold' }}>"{confirmModal.songTitle}"</Text>?
                </Text>
                <Text style={styles.modalSubMessage}>
                  Bài hát sẽ vẫn tiếp tục hiển thị bình thường trên ứng dụng.
                </Text>
              </View>
            )}

            <View style={styles.modalBtnRow}>
              <Pressable
                style={styles.modalCancelBtn}
                onPress={() => setConfirmModal((prev) => ({ ...prev, visible: false }))}
              >
                <Text style={styles.modalCancelBtnText}>Hủy bỏ</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.modalConfirmBtn,
                  confirmModal.status === 'accepted' ? { backgroundColor: '#10B981' } : { backgroundColor: '#EF4444' },
                ]}
                onPress={() => {
                  if (confirmModal.complaintId && confirmModal.status) {
                    const cId = confirmModal.complaintId;
                    const st = confirmModal.status;
                    setConfirmModal((prev) => ({ ...prev, visible: false }));
                    handleAction(cId, st);
                  }
                }}
              >
                <Text style={styles.modalConfirmBtnText}>
                  {confirmModal.status === 'accepted' ? 'Xác nhận Tiếp nhận' : 'Xác nhận Từ chối'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  filterTabActive: {
    backgroundColor: '#4338CA',
    borderColor: '#6366F1',
  },
  filterTabText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyWrap: {
    padding: 36,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  listContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  complaintIdText: {
    color: '#A5B4FC',
    fontSize: 14,
    fontWeight: '800',
  },
  dateText: {
    color: '#64748B',
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgePending: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  badgeAccepted: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  badgeRejected: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  textPending: { color: '#F59E0B' },
  textAccepted: { color: '#10B981' },
  textRejected: { color: '#EF4444' },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 8,
  },
  infoBox: {
    flex: 1,
    minWidth: 240,
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  boxTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  mediaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coverThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#0F172A',
  },
  avatarThumb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#0F172A',
  },
  mediaMeta: {
    flex: 1,
  },
  songTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  artistName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  userMeta: {
    gap: 4,
  },
  userName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  userEmail: {
    color: '#CBD5E1',
    fontSize: 13,
  },
  metaSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  reasonBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: '#6366F1',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  reasonBadgeText: {
    color: '#A5B4FC',
    fontSize: 12,
    fontWeight: '700',
  },
  descText: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 20,
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 110,
  },
  btnAccept: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  btnReject: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnTextAccept: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 13,
  },
  btnTextReject: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 13,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  modalMessage: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 22,
  },
  modalSubMessage: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 8,
  },
  infoAlertBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  infoAlertTitle: {
    color: '#FBBF24',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 4,
  },
  infoAlertText: {
    color: '#FDE68A',
    fontSize: 12,
    lineHeight: 18,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  modalCancelBtn: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalCancelBtnText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 13,
  },
  modalConfirmBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalConfirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
