import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
  TextInput,
  Image,
} from 'react-native';
import { fetchAdminRevenueReport } from '@/src/lib/api/admin-api';
import { AdminRevenueReport } from '@/src/types/admin';
import { getCoverUrl } from '@/src/lib/cover-image';
import { formatCurrency } from '@/src/lib/format-currency';

export function AdminRevenueView() {
  const [report, setReport] = useState<AdminRevenueReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'artists' | 'top_songs' | 'payouts'>('artists');

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminRevenueReport();
      setReport(data);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Không thể tải báo cáo doanh thu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const formatVND = (amount: number) => {
    return formatCurrency(amount) + ' ₫';
  };

  const filteredArtists = useMemo(() => {
    if (!report?.artist_breakdown) return [];
    if (!searchQuery.trim()) return report.artist_breakdown;
    const query = searchQuery.toLowerCase().trim();
    return report.artist_breakdown.filter((art) =>
      art.artist_name.toLowerCase().includes(query)
    );
  }, [report?.artist_breakdown, searchQuery]);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#A78BFA" />
        <Text style={styles.loadingText}>Đang tổng hợp báo cáo tài chính & doanh thu...</Text>
      </View>
    );
  }

  if (error || !report) {
    return (
      <View style={styles.errorWrap}>
        <Text style={styles.errorText}>{error || 'Không có dữ liệu báo cáo.'}</Text>
        <Pressable onPress={loadReport} style={styles.retryBtn}>
          <Text style={styles.retryBtnText}>Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  const { summary, payout_summary, top_songs } = report;

  // Tính tỷ lệ phân bổ tài chính
  const grossRev = summary.gross_system_revenue || 1;
  const artistSharePct = Math.min(100, Math.round((summary.total_artist_net_earnings / grossRev) * 100));
  const platformSharePct = Math.min(100, Math.round((summary.platform_net_revenue / grossRev) * 100));
  const taxPct = Math.min(100, Math.round((summary.pit_tax_withheld / grossRev) * 100));

  return (
    <View style={styles.container}>
      {/* Header Info Banner */}
      <View style={styles.bannerContainer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>📈 Báo cáo Thống kê Doanh thu Hệ thống</Text>
          <Text style={styles.bannerSubTitle}>
            Tổng hợp dữ liệu doanh thu lượt nghe bài hát (100đ/lượt), lượt click quảng cáo banner (3.000đ/click), phân bổ thu nhập cho Nghệ sĩ và lợi nhuận hệ thống.
          </Text>
        </View>
        <Pressable style={styles.refreshBtn} onPress={loadReport}>
          <Text style={styles.refreshBtnText}>🔄 Cập nhật số liệu</Text>
        </Pressable>
      </View>

      {/* Primary Stat Cards */}
      <View style={styles.grid}>
        <View style={[styles.statCard, { borderTopColor: '#A78BFA' }]}>
          <Text style={styles.statLabel}>Tổng Doanh thu Gộp (Gross)</Text>
          <Text style={[styles.statValue, { color: '#A78BFA' }]}>{formatVND(summary.gross_system_revenue)}</Text>
          <Text style={styles.statSubText}>
            Lượt nghe: {formatVND(summary.song_play_revenue)} • Banner: {formatVND(summary.ad_banner_revenue)}
          </Text>
        </View>

        <View style={[styles.statCard, { borderTopColor: '#22C55E' }]}>
          <Text style={styles.statLabel}>Lợi nhuận Hệ thống Giữ lại</Text>
          <Text style={[styles.statValue, { color: '#22C55E' }]}>{formatVND(summary.platform_net_revenue)}</Text>
          <Text style={styles.statSubText}>
            30% QC Banner: {formatVND(summary.platform_ad_share)} + Thuế TNCN: {formatVND(summary.pit_tax_withheld)}
          </Text>
        </View>

        <View style={[styles.statCard, { borderTopColor: '#38BDF8' }]}>
          <Text style={styles.statLabel}>Tổng Thu nhập Artist Thực nhận</Text>
          <Text style={[styles.statValue, { color: '#38BDF8' }]}>{formatVND(summary.total_artist_net_earnings)}</Text>
          <Text style={styles.statSubText}>
            Sau khi trừ 10% thuế TNCN từ phần quảng cáo
          </Text>
        </View>

        <View style={[styles.statCard, { borderTopColor: '#F59E0B' }]}>
          <Text style={styles.statLabel}>Tổng Tiền đã Chi trả (Payouts)</Text>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>{formatVND(payout_summary.approved_amount)}</Text>
          <Text style={styles.statSubText}>
            Đang chờ duyệt: <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>{formatVND(payout_summary.pending_amount)}</Text>
          </Text>
        </View>
      </View>

      {/* Secondary Metrics & Financial Distribution Bar */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>📊 Phân bổ Tỷ lệ Tài chính Hệ thống</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${artistSharePct}%`, backgroundColor: '#38BDF8' }]} />
          <View style={[styles.progressFill, { width: `${platformSharePct}%`, backgroundColor: '#22C55E' }]} />
          <View style={[styles.progressFill, { width: `${taxPct}%`, backgroundColor: '#F59E0B' }]} />
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#38BDF8' }]} />
            <Text style={styles.legendText}>Thu nhập Artist thực nhận ({artistSharePct}%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
            <Text style={styles.legendText}>Hệ thống giữ lại (30% QC) ({platformSharePct}%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Thuế TNCN thu hộ (10%) ({taxPct}%)</Text>
          </View>
        </View>
      </View>

      {/* Tabs Navigation */}
      <View style={styles.tabNavRow}>
        <Pressable
          style={[styles.tabBtn, activeTab === 'artists' && styles.activeTabBtn]}
          onPress={() => setActiveTab('artists')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'artists' && styles.activeTabBtnText]}>
            🎤 Doanh thu theo Nghệ sĩ ({report.artist_breakdown.length})
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tabBtn, activeTab === 'top_songs' && styles.activeTabBtn]}
          onPress={() => setActiveTab('top_songs')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'top_songs' && styles.activeTabBtnText]}>
            🔥 Top Bài hát Doanh thu
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tabBtn, activeTab === 'payouts' && styles.activeTabBtn]}
          onPress={() => setActiveTab('payouts')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'payouts' && styles.activeTabBtnText]}>
            💳 Trạng thái Rút tiền ({payout_summary.total_requests})
          </Text>
        </Pressable>
      </View>

      {/* Tab 1: Artist Breakdown Table */}
      {activeTab === 'artists' && (
        <View style={styles.card}>
          <View style={styles.tableHeaderSearch}>
            <Text style={styles.cardHeading}>Chi tiết Doanh thu & Thuế từng Nghệ sĩ</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="🔍 Tìm kiếm tên nghệ sĩ..."
              placeholderTextColor="#64748B"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={{ minWidth: 960 }}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.th, { width: 220 }]}>Nghệ sĩ</Text>
                <Text style={[styles.th, { width: 80, textAlign: 'center' }]}>Số bài</Text>
                <Text style={[styles.th, { width: 100, textAlign: 'right' }]}>Lượt nghe</Text>
                <Text style={[styles.th, { width: 100, textAlign: 'right' }]}>Click Banner</Text>
                <Text style={[styles.th, { width: 120, textAlign: 'right' }]}>Tiền Bài hát (100đ)</Text>
                <Text style={[styles.th, { width: 120, textAlign: 'right' }]}>Tiền QC (3.000đ)</Text>
                <Text style={[styles.th, { width: 110, textAlign: 'right' }]}>Thuế TNCN (10%)</Text>
                <Text style={[styles.th, { width: 130, textAlign: 'right' }]}>Artist Thực nhận</Text>
                <Text style={[styles.th, { width: 120, textAlign: 'right' }]}>Đã rút</Text>
                <Text style={[styles.th, { width: 130, textAlign: 'right' }]}>Số dư khả dụng</Text>
              </View>

              {filteredArtists.length === 0 ? (
                <Text style={styles.emptyTableText}>Không tìm thấy nghệ sĩ phù hợp.</Text>
              ) : (
                filteredArtists.map((art) => (
                  <View key={art.artist_id} style={styles.tableBodyRow}>
                    <View style={[{ width: 220, flexDirection: 'row', alignItems: 'center' }]}>
                      <Image
                        source={{
                          uri: art.avatar_url
                            ? getCoverUrl(art.avatar_url)
                            : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
                        }}
                        style={styles.artistAvatar}
                      />
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text style={styles.artistNameText} numberOfLines={1}>{art.artist_name}</Text>
                        <Text style={styles.artistSubText}>ID: #{art.artist_id}</Text>
                      </View>
                    </View>

                    <Text style={[styles.td, { width: 80, textAlign: 'center' }]}>{art.total_songs}</Text>
                    <Text style={[styles.td, { width: 100, textAlign: 'right', color: '#38BDF8' }]}>{art.total_plays.toLocaleString('vi-VN')}</Text>
                    <Text style={[styles.td, { width: 100, textAlign: 'right', color: '#F59E0B' }]}>{art.banner_clicks.toLocaleString('vi-VN')}</Text>
                    <Text style={[styles.td, { width: 120, textAlign: 'right' }]}>{formatVND(art.song_revenue)}</Text>
                    <Text style={[styles.td, { width: 120, textAlign: 'right' }]}>{formatVND(art.ad_gross_revenue)}</Text>
                    <Text style={[styles.td, { width: 110, textAlign: 'right', color: '#EF4444' }]}>-{formatVND(art.pit_tax)}</Text>
                    <Text style={[styles.td, { width: 130, textAlign: 'right', fontWeight: 'bold', color: '#22C55E' }]}>{formatVND(art.artist_net)}</Text>
                    <Text style={[styles.td, { width: 120, textAlign: 'right', color: '#94A3B8' }]}>{formatVND(art.total_withdrawn)}</Text>
                    <Text style={[styles.td, { width: 130, textAlign: 'right', fontWeight: 'bold', color: '#A78BFA' }]}>{formatVND(art.available_balance)}</Text>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Tab 2: Top Revenue Songs */}
      {activeTab === 'top_songs' && (
        <View style={styles.card}>
          <Text style={styles.cardHeading}>🔥 Xếp hạng 10 Bài hát Đóng góp Doanh thu Lượt nghe cao nhất</Text>
          <View style={{ marginTop: 12 }}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.th, { width: 60, textAlign: 'center' }]}>#</Text>
              <Text style={[styles.th, { flex: 1 }]}>Bài hát</Text>
              <Text style={[styles.th, { width: 180 }]}>Nghệ sĩ</Text>
              <Text style={[styles.th, { width: 130, textAlign: 'right' }]}>Số lượt nghe</Text>
              <Text style={[styles.th, { width: 160, textAlign: 'right' }]}>Doanh thu bài hát (100đ)</Text>
            </View>

            {top_songs.length === 0 ? (
              <Text style={styles.emptyTableText}>Chưa có bài hát nào.</Text>
            ) : (
              top_songs.map((song, idx) => (
                <View key={song.song_id} style={styles.tableBodyRow}>
                  <Text style={[styles.td, { width: 60, textAlign: 'center', fontWeight: 'bold', color: idx < 3 ? '#F59E0B' : '#94A3B8' }]}>
                    #{idx + 1}
                  </Text>

                  <View style={[{ flex: 1, flexDirection: 'row', alignItems: 'center' }]}>
                    <Image
                      source={{ uri: getCoverUrl(song.cover_url) }}
                      style={styles.songCover}
                    />
                    <Text style={[styles.songTitleText, { marginLeft: 10 }]} numberOfLines={1}>
                      {song.title}
                    </Text>
                  </View>

                  <Text style={[styles.td, { width: 180, color: '#A78BFA' }]} numberOfLines={1}>
                    {song.artist_name}
                  </Text>

                  <Text style={[styles.td, { width: 130, textAlign: 'right', color: '#38BDF8', fontWeight: 'bold' }]}>
                    {song.play_count.toLocaleString('vi-VN')}
                  </Text>

                  <Text style={[styles.td, { width: 160, textAlign: 'right', color: '#22C55E', fontWeight: 'bold' }]}>
                    {formatVND(song.song_revenue)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      )}

      {/* Tab 3: Payout Status Breakdown */}
      {activeTab === 'payouts' && (
        <View style={styles.card}>
          <Text style={styles.cardHeading}>💳 Tổng quan Yêu cầu Rút tiền từ Nghệ sĩ</Text>

          <View style={styles.payoutGrid}>
            <View style={[styles.payoutCard, { backgroundColor: 'rgba(34, 197, 94, 0.1)', borderColor: '#22C55E' }]}>
              <Text style={[styles.payoutTitle, { color: '#22C55E' }]}>✅ Đã phê duyệt (Approved)</Text>
              <Text style={styles.payoutValue}>{formatVND(payout_summary.approved_amount)}</Text>
              <Text style={styles.payoutSub}>Đã chuyển khoản thành công cho các nghệ sĩ</Text>
            </View>

            <View style={[styles.payoutCard, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#EF4444' }]}>
              <Text style={[styles.payoutTitle, { color: '#EF4444' }]}>⏳ Đang chờ duyệt (Pending)</Text>
              <Text style={styles.payoutValue}>{formatVND(payout_summary.pending_amount)}</Text>
              <Text style={styles.payoutSub}>Cần Admin xử lý duyệt trong phần "Yêu cầu rút tiền"</Text>
            </View>

            <View style={[styles.payoutCard, { backgroundColor: 'rgba(148, 163, 184, 0.1)', borderColor: '#64748B' }]}>
              <Text style={[styles.payoutTitle, { color: '#94A3B8' }]}>❌ Đã từ chối (Rejected)</Text>
              <Text style={styles.payoutValue}>{formatVND(payout_summary.rejected_amount)}</Text>
              <Text style={styles.payoutSub}>Các yêu cầu rút tiền không hợp lệ</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingWrap: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 16,
    fontSize: 15,
  },
  errorWrap: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#312E81',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#A78BFA',
    fontWeight: '600',
  },
  bannerContainer: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  bannerSubTitle: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  refreshBtn: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginLeft: 16,
  },
  refreshBtnText: {
    color: '#E2E8F0',
    fontWeight: '600',
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: 240,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderTopWidth: 4,
    borderRadius: 16,
    padding: 18,
    margin: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  statSubText: {
    fontSize: 12,
    color: '#64748B',
  },
  card: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  progressTrack: {
    height: 14,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    color: '#CBD5E1',
    fontSize: 13,
  },
  tabNavRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  activeTabBtn: {
    backgroundColor: '#312E81',
    borderColor: '#6366F1',
  },
  tabBtnText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tableHeaderSearch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  searchInput: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 13,
    minWidth: 260,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  th: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tableBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  td: {
    color: '#E2E8F0',
    fontSize: 13,
  },
  artistAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#334155',
  },
  artistNameText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  artistSubText: {
    color: '#64748B',
    fontSize: 11,
  },
  emptyTableText: {
    color: '#64748B',
    padding: 24,
    textAlign: 'center',
  },
  songCover: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#334155',
  },
  songTitleText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    flex: 1,
  },
  payoutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  payoutCard: {
    flex: 1,
    minWidth: 250,
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
    margin: 8,
  },
  payoutTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  payoutValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  payoutSub: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
});
