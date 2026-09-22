import { AppHeader } from '@/src/components/ui/app-header';
import { Footer } from '@/src/components/ui/footer';
import { useFooterActions } from '@/src/constants/footer-actions';
import { useAuth } from '@/src/contexts/auth';
import {
  ArtistProfile,
  ArtistRevenueData,
  ArtistSong,
  createArtistSong,
  deleteArtistSong,
  getArtistProfile,
  getArtistRevenue,
  getArtistSongs,
  requestPayout,
  updateArtistProfile,
  upgradeToArtist,
} from '@/src/lib/api/artist-api';
import { audioPlayer } from '@/src/lib/audio-player';
import { getCoverUrl } from '@/src/lib/cover-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GENRE_LIST = [
  { id: 1, name: 'Pop' },
  { id: 2, name: 'R&B' },
  { id: 3, name: 'Hip-Hop/Rap' },
  { id: 4, name: 'Indie' },
  { id: 5, name: 'Ballad' },
  { id: 6, name: 'Rock' },
  { id: 7, name: 'EDM' },
  { id: 8, name: 'Jazz' },
  { id: 9, name: 'Classical' },
  { id: 10, name: 'Lofi' },
];

export default function ArtistStudioScreen() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const footerActions = useFooterActions('artist-studio');

  const [activeTab, setActiveTab] = useState<'revenue' | 'songs' | 'upload'>('revenue');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Dữ liệu Artist & Doanh thu & Danh sách bài hát
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [revenueData, setRevenueData] = useState<ArtistRevenueData | null>(null);
  const [songs, setSongs] = useState<ArtistSong[]>([]);
  const [playingSongId, setPlayingSongId] = useState<number | null>(null);

  // Form đăng bài hát mới
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDuration, setUploadDuration] = useState('210');
  const [uploadAudioUrl, setUploadAudioUrl] = useState('');
  const [uploadCoverUrl, setUploadCoverUrl] = useState('');
  const [uploadLyrics, setUploadLyrics] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<number[]>([1]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Modal rút tiền
  const [payoutModalVisible, setPayoutModalVisible] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [bankName, setBankName] = useState('MB Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [payoutNotice, setPayoutNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal sửa hồ sơ
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Nâng cấp tài khoản lên Nghệ sĩ
  const [upgrading, setUpgrading] = useState(false);

  // Theo dõi trạng thái audio player
  useEffect(() => {
    const unsub = audioPlayer.subscribe((state) => {
      setPlayingSongId(state.isPlaying ? state.songId : null);
    });
    return unsub;
  }, []);

  // Tải toàn bộ dữ liệu của Artist Studio
  const loadData = useCallback(async () => {
    if (!user || (user.role !== 'artist' && user.role !== 'admin')) return;
    try {
      setLoading(true);
      const [profileRes, songsRes, revRes] = await Promise.all([
        getArtistProfile().catch(() => null),
        getArtistSongs().catch(() => null),
        getArtistRevenue().catch(() => null),
      ]);

      if (profileRes?.artist) {
        setProfile(profileRes.artist);
        setEditName(profileRes.artist.name || '');
        setEditBio(profileRes.artist.bio || '');
        setEditAvatar(profileRes.artist.avatar_url || '');
      }
      if (songsRes?.songs) {
        setSongs(songsRes.songs);
      }
      if (revRes) {
        setRevenueData(revRes);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu Artist Studio:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && (user.role === 'artist' || user.role === 'admin')) {
      void loadData();
    } else {
      setLoading(false);
    }
  }, [user, loadData]);

  // Xử lý phát bài hát
  const handleTogglePlay = async (song: ArtistSong) => {
    if (playingSongId === song.song_id) {
      await audioPlayer.togglePlay();
    } else {
      await audioPlayer.playTrack({ songId: song.song_id, audioUrl: song.audio_url });
    }
  };

  // Xử lý xóa bài hát
  const handleDeleteSong = (songId: number, songTitle: string) => {
    const confirmDelete = async () => {
      try {
        await deleteArtistSong(songId);
        setSongs((prev) => prev.filter((s) => s.song_id !== songId));
        void loadData();
        Alert.alert('Thành công', `Đã xóa bài hát "${songTitle}".`);
      } catch (err: any) {
        Alert.alert('Lỗi', err.message || 'Không thể xóa bài hát.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Bạn có chắc chắn muốn xóa bài hát "${songTitle}" khỏi danh sách không?`)) {
        void confirmDelete();
      }
    } else {
      Alert.alert(
        'Xác nhận xóa bài hát',
        `Bạn có chắc chắn muốn xóa bài hát "${songTitle}" không? Thao tác này không thể hoàn tác.`,
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Xóa', style: 'destructive', onPress: confirmDelete },
        ]
      );
    }
  };

  // Xử lý đăng tải bài hát mới
  const handlePublishSong = async () => {
    setUploadError('');
    setUploadSuccess('');

    if (!uploadTitle.trim()) {
      setUploadError('Vui lòng nhập tên bài hát.');
      return;
    }
    if (!uploadAudioUrl.trim()) {
      setUploadError('Vui lòng nhập đường dẫn Audio URL (link file mp3).');
      return;
    }

    try {
      setUploading(true);
      const res = await createArtistSong({
        title: uploadTitle.trim(),
        duration: Number(uploadDuration) || 180,
        audio_url: uploadAudioUrl.trim(),
        cover_url: uploadCoverUrl.trim() || undefined,
        lyrics: uploadLyrics.trim() || undefined,
        genres: selectedGenres,
      });

      setUploadSuccess(`Đã đăng bài hát "${uploadTitle.trim()}" thành công!`);
      setUploadTitle('');
      setUploadAudioUrl('');
      setUploadCoverUrl('');
      setUploadLyrics('');

      // Reload danh sách bài hát và chuyển về tab Bài hát
      await loadData();
      setTimeout(() => {
        setActiveTab('songs');
      }, 1200);
    } catch (err: any) {
      setUploadError(err.message || 'Đăng bài hát thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  // Xử lý gửi yêu cầu rút tiền
  const handleRequestPayout = async () => {
    setPayoutNotice(null);
    const amountNum = Number(payoutAmount);
    if (!amountNum || amountNum <= 0) {
      setPayoutNotice({ type: 'error', message: 'Vui lòng nhập số tiền rút hợp lệ.' });
      return;
    }
    if (!accountNumber.trim() || !accountHolder.trim()) {
      setPayoutNotice({ type: 'error', message: 'Vui lòng điền số tài khoản và tên chủ tài khoản.' });
      return;
    }

    try {
      setPayoutSubmitting(true);
      const res = await requestPayout({
        amount: amountNum,
        bank_name: bankName,
        account_number: accountNumber.trim(),
        account_holder: accountHolder.trim().toUpperCase(),
      });

      setPayoutNotice({ type: 'success', message: res.message });
      setPayoutAmount('');
      void loadData();
      setTimeout(() => {
        setPayoutModalVisible(false);
        setPayoutNotice(null);
      }, 2500);
    } catch (err: any) {
      setPayoutNotice({ type: 'error', message: err.message || 'Yêu cầu rút tiền không thành công.' });
    } finally {
      setPayoutSubmitting(false);
    }
  };

  // Xử lý lưu thông tin hồ sơ nghệ sĩ
  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Lỗi', 'Tên nghệ danh không được để trống.');
      return;
    }
    try {
      setSavingProfile(true);
      const res = await updateArtistProfile({
        name: editName.trim(),
        bio: editBio.trim(),
        avatar_url: editAvatar.trim(),
      });
      setProfile(res.artist);
      setEditProfileModal(false);
      Alert.alert('Thành công', 'Đã cập nhật thông tin nghệ sĩ!');
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể cập nhật hồ sơ.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Nâng cấp lên tài khoản nghệ sĩ
  const handleUpgradeAccount = async () => {
    try {
      setUpgrading(true);
      await upgradeToArtist();
      Alert.alert('Thành công', 'Tài khoản của bạn đã được nâng cấp lên Nghệ sĩ!');
      // Reload auth or data
      await loadData();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Nâng cấp thất bại.');
    } finally {
      setUpgrading(false);
    }
  };

  // Kiểm tra trạng thái xác thực
  if (authLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  // Chưa đăng nhập
  if (!user) {
    return (
      <SafeAreaView style={styles.page}>
        <AppHeader title="Studio Nghệ sĩ" onBackPress={() => router.replace('/')} />
        <View style={styles.unauthCard}>
          <Ionicons name="mic-circle" size={80} color="#8B5CF6" />
          <Text style={styles.unauthTitle}>Dành riêng cho Nghệ sĩ</Text>
          <Text style={styles.unauthDesc}>
            Đăng nhập để quản lý các bài hát, theo dõi lượt nghe trực tiếp và nhận doanh thu từ nền tảng.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/login')}>
            <Text style={styles.primaryButtonText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
        </View>
        <Footer actions={footerActions} />
      </SafeAreaView>
    );
  }

  // Là người dùng thường -> Mời nâng cấp lên Nghệ sĩ
  if (user.role !== 'artist' && user.role !== 'admin') {
    return (
      <SafeAreaView style={styles.page}>
        <AppHeader title="Trở thành Nghệ sĩ" onBackPress={() => router.replace('/')} />
        <ScrollView contentContainerStyle={styles.upgradeContainer}>
          <View style={styles.upgradeHeader}>
            <Ionicons name="sparkles" size={64} color="#A78BFA" />
            <Text style={styles.upgradeTitle}>Bắt đầu sự nghiệp âm nhạc của bạn</Text>
            <Text style={styles.upgradeSubtitle}>
              Phát hành bài hát của bạn tới hàng nghìn người nghe, theo dõi lượt stream và kiếm tiền từ đam mê âm nhạc.
            </Text>
          </View>

          <View style={styles.perkList}>
            <View style={styles.perkItem}>
              <Ionicons name="cloud-upload" size={26} color="#8B5CF6" />
              <View style={styles.perkText}>
                <Text style={styles.perkTitle}>Tải lên bài hát không giới hạn</Text>
                <Text style={styles.perkDesc}>Đăng tải ca khúc vào hệ thống songs cùng ảnh bìa và thể loại âm nhạc.</Text>
              </View>
            </View>

            <View style={styles.perkItem}>
              <Ionicons name="cash" size={26} color="#10B981" />
              <View style={styles.perkText}>
                <Text style={styles.perkTitle}>Kiếm thu nhập từ lượt nghe</Text>
                <Text style={styles.perkDesc}>Nền tảng chi trả 100 VNĐ cho mỗi lượt nghe trực tiếp từ thính giả.</Text>
              </View>
            </View>

            <View style={styles.perkItem}>
              <Ionicons name="analytics" size={26} color="#38BDF8" />
              <View style={styles.perkText}>
                <Text style={styles.perkTitle}>Báo cáo doanh thu minh bạch</Text>
                <Text style={styles.perkDesc}>Bảng kê chi tiết số lượt nghe và doanh thu tích lũy từng bài hát.</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            disabled={upgrading}
            style={[styles.primaryButton, upgrading && { opacity: 0.6 }]}
            onPress={handleUpgradeAccount}>
            {upgrading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Kích hoạt Kênh Nghệ sĩ ngay</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
        <Footer actions={footerActions} />
      </SafeAreaView>
    );
  }

  // Đã đăng nhập với quyền Nghệ sĩ
  return (
    <SafeAreaView style={styles.page}>
      <AppHeader
        title="Artist Studio"
        onBackPress={() => router.replace('/')}
        rightAction={
          <TouchableOpacity
            style={styles.headerEditBtn}
            onPress={() => setEditProfileModal(true)}>
            <Ionicons name="settings-outline" size={20} color="#A78BFA" />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card Nghệ sĩ */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: profile?.avatar_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400' }}
            style={styles.artistAvatar}
          />
          <View style={styles.artistInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.artistName} numberOfLines={1}>
                {profile?.name || user.username}
              </Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#8B5CF6" />
                <Text style={styles.verifiedText}>Nghệ sĩ</Text>
              </View>
            </View>
            <Text style={styles.artistBio} numberOfLines={2}>
              {profile?.bio || 'Chưa có tiểu sử.'}
            </Text>
            <Text style={styles.artistMeta}>
              {songs.length} bài hát • {revenueData?.total_plays?.toLocaleString() || 0} lượt nghe
            </Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'revenue' && styles.tabItemActive]}
            onPress={() => setActiveTab('revenue')}>
            <Ionicons name="bar-chart" size={18} color={activeTab === 'revenue' ? '#A78BFA' : '#94A3B8'} />
            <Text style={[styles.tabItemText, activeTab === 'revenue' && styles.tabItemTextActive]}>
              Doanh thu
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'songs' && styles.tabItemActive]}
            onPress={() => setActiveTab('songs')}>
            <Ionicons name="musical-notes" size={18} color={activeTab === 'songs' ? '#A78BFA' : '#94A3B8'} />
            <Text style={[styles.tabItemText, activeTab === 'songs' && styles.tabItemTextActive]}>
              Bài hát ({songs.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'upload' && styles.tabItemActive]}
            onPress={() => setActiveTab('upload')}>
            <Ionicons name="cloud-upload" size={18} color={activeTab === 'upload' ? '#A78BFA' : '#94A3B8'} />
            <Text style={[styles.tabItemText, activeTab === 'upload' && styles.tabItemTextActive]}>
              Đăng nhạc
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={{ color: '#94A3B8', marginTop: 12 }}>Đang tải dữ liệu Studio...</Text>
          </View>
        ) : null}

        {/* TAB 1: DOANH THU & THỐNG KÊ */}
        {!loading && activeTab === 'revenue' && (
          <View style={styles.tabContent}>
            {/* Thống kê doanh thu */}
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { borderLeftColor: '#8B5CF6' }]}>
                <Text style={styles.statLabel}>Tổng lượt view/nghe</Text>
                <Text style={styles.statValue}>{revenueData?.total_plays?.toLocaleString() || '0'}</Text>
                <Text style={styles.statSub}>Đơn giá: 100 VNĐ / view</Text>
              </View>

              <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
                <Text style={styles.statLabel}>Tổng doanh thu tích lũy</Text>
                <Text style={[styles.statValue, { color: '#10B981' }]}>
                  {(revenueData?.total_revenue || 0).toLocaleString()} VNĐ
                </Text>
                <Text style={styles.statSub}>Đã bao gồm thuế nền tảng</Text>
              </View>
            </View>

            {/* Thẻ rút tiền */}
            <View style={styles.payoutCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.payoutTitle}>Số dư khả dụng</Text>
                <Text style={styles.payoutBalance}>
                  {(revenueData?.withdrawable_balance || 0).toLocaleString()} VNĐ
                </Text>
              </View>
              <TouchableOpacity
                style={styles.payoutButton}
                onPress={() => {
                  setPayoutAmount(String(revenueData?.withdrawable_balance || 0));
                  setPayoutModalVisible(true);
                }}>
                <Ionicons name="card-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.payoutButtonText}>Rút tiền</Text>
              </TouchableOpacity>
            </View>

            {/* Bảng phân tích theo từng bài hát */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Doanh thu chi tiết từng bài hát</Text>
            </View>

            {revenueData?.song_breakdown?.length ? (
              <View style={styles.tableCard}>
                {revenueData.song_breakdown.map((item, idx) => (
                  <View key={item.song_id} style={[styles.tableRow, idx > 0 && styles.tableRowBorder]}>
                    <Image
                      source={{ uri: getCoverUrl(item.cover_url) }}
                      style={styles.tableCover}
                    />
                    <View style={styles.tableInfo}>
                      <Text style={styles.tableSongTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.tableSongDate}>Ngày đăng: {item.created_date || 'Gần đây'}</Text>
                    </View>
                    <View style={styles.tableStats}>
                      <Text style={styles.tablePlays}>{item.play_count.toLocaleString()} views</Text>
                      <Text style={styles.tableRevenue}>+{item.song_revenue.toLocaleString()} VNĐ</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="disc-outline" size={48} color="#64748B" />
                <Text style={styles.emptyText}>Chưa có bài hát nào được phát hành.</Text>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => setActiveTab('upload')}>
                  <Text style={styles.secondaryButtonText}>Đăng bài hát đầu tiên ngay</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* TAB 2: QUẢN LÝ BÀI HÁT */}
        {!loading && activeTab === 'songs' && (
          <View style={styles.tabContent}>
            <View style={styles.songsHeaderRow}>
              <Text style={styles.sectionTitle}>Danh sách bài hát đã phát hành ({songs.length})</Text>
              <TouchableOpacity
                style={styles.addSongBtn}
                onPress={() => setActiveTab('upload')}>
                <Ionicons name="add" size={18} color="#FFF" />
                <Text style={styles.addSongBtnText}>Thêm bài</Text>
              </TouchableOpacity>
            </View>

            {songs.length > 0 ? (
              songs.map((song) => (
                <View key={song.song_id} style={styles.songCard}>
                  <Image
                    source={{ uri: getCoverUrl(song.cover_url) }}
                    style={styles.songCover}
                  />

                  <View style={styles.songDetails}>
                    <Text style={styles.songTitle} numberOfLines={1}>
                      {song.title}
                    </Text>
                    <Text style={styles.songGenre}>
                      {song.genres || 'Âm nhạc'} • {Math.floor(song.duration / 60)}:
                      {String(song.duration % 60).padStart(2, '0')}
                    </Text>
                    <View style={styles.songStatBadgeRow}>
                      <View style={styles.badgePlay}>
                        <Ionicons name="headset-outline" size={12} color="#94A3B8" />
                        <Text style={styles.badgeText}>{song.play_count.toLocaleString()} lượt</Text>
                      </View>
                      <View style={styles.badgeMoney}>
                        <Ionicons name="trending-up" size={12} color="#10B981" />
                        <Text style={[styles.badgeText, { color: '#10B981' }]}>
                          +{song.revenue.toLocaleString()} VNĐ
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.songActions}>
                    <TouchableOpacity
                      style={[
                        styles.actionCircleBtn,
                        playingSongId === song.song_id && styles.actionCircleBtnActive,
                      ]}
                      onPress={() => handleTogglePlay(song)}>
                      <Ionicons
                        name={playingSongId === song.song_id ? 'pause' : 'play'}
                        size={18}
                        color={playingSongId === song.song_id ? '#8B5CF6' : '#F8FAFC'}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionCircleBtn, { backgroundColor: '#331D2C' }]}
                      onPress={() => handleDeleteSong(song.song_id, song.title)}>
                      <Ionicons name="trash-outline" size={18} color="#FDA4AF" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="musical-notes-outline" size={54} color="#64748B" />
                <Text style={styles.emptyTitle}>Chưa có bài hát nào</Text>
                <Text style={styles.emptyText}>Đăng tải bài hát mới để bắt đầu thu hút người nghe và nhận doanh thu.</Text>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => setActiveTab('upload')}>
                  <Text style={styles.primaryButtonText}>Đăng bài hát ngay</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* TAB 3: ĐĂNG BÀI HÁT MỚI */}
        {!loading && activeTab === 'upload' && (
          <View style={styles.tabContent}>
            <View style={styles.uploadCard}>
              <Text style={styles.uploadTitle}>Đăng tải bài hát mới</Text>
              <Text style={styles.uploadDesc}>
                Bài hát sau khi đăng sẽ hiển thị trực tiếp trên kho nhạc, trang chủ và kênh nghệ sĩ của bạn.
              </Text>

              {uploadError ? (
                <View style={styles.alertBoxError}>
                  <Ionicons name="alert-circle" size={18} color="#FDA4AF" />
                  <Text style={styles.alertTextError}>{uploadError}</Text>
                </View>
              ) : null}

              {uploadSuccess ? (
                <View style={styles.alertBoxSuccess}>
                  <Ionicons name="checkmark-circle" size={18} color="#6EE7B7" />
                  <Text style={styles.alertTextSuccess}>{uploadSuccess}</Text>
                </View>
              ) : null}

              {/* Tên bài hát */}
              <Text style={styles.inputLabel}>Tên bài hát *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: Nơi Này Có Anh, Em Của Ngày Hôm Qua..."
                placeholderTextColor="#64748B"
                value={uploadTitle}
                onChangeText={setUploadTitle}
              />

              {/* Thời lượng */}
              <Text style={styles.inputLabel}>Thời lượng (tính bằng giây) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: 245 (= 4 phút 05 giây)"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={uploadDuration}
                onChangeText={setUploadDuration}
              />

              {/* Audio URL */}
              <Text style={styles.inputLabel}>Link Audio file (.mp3 / stream) *</Text>
              <TextInput
                style={styles.input}
                placeholder="https://example.com/audio/bai-hat.mp3"
                placeholderTextColor="#64748B"
                autoCapitalize="none"
                value={uploadAudioUrl}
                onChangeText={setUploadAudioUrl}
              />

              {/* Cover Image URL */}
              <Text style={styles.inputLabel}>Link Ảnh bìa (Cover URL)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://example.com/covers/anh-bia.jpg"
                placeholderTextColor="#64748B"
                autoCapitalize="none"
                value={uploadCoverUrl}
                onChangeText={setUploadCoverUrl}
              />

              {/* Preview Cover nếu có */}
              {uploadCoverUrl.trim() ? (
                <View style={styles.coverPreviewContainer}>
                  <Image source={{ uri: uploadCoverUrl.trim() }} style={styles.coverPreview} />
                  <Text style={styles.coverPreviewText}>Xem trước ảnh bìa</Text>
                </View>
              ) : null}

              {/* Thể loại */}
              <Text style={styles.inputLabel}>Chọn Thể loại</Text>
              <View style={styles.genreTagsContainer}>
                {GENRE_LIST.map((genre) => {
                  const isSelected = selectedGenres.includes(genre.id);
                  return (
                    <TouchableOpacity
                      key={genre.id}
                      style={[styles.genreTag, isSelected && styles.genreTagActive]}
                      onPress={() => {
                        if (isSelected) {
                          setSelectedGenres(selectedGenres.filter((id) => id !== genre.id));
                        } else {
                          setSelectedGenres([...selectedGenres, genre.id]);
                        }
                      }}>
                      <Text style={[styles.genreTagText, isSelected && styles.genreTagTextActive]}>
                        {genre.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Lời bài hát */}
              <Text style={styles.inputLabel}>Lời bài hát (Lyrics)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Nhập lời bài hát tại đây..."
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={5}
                value={uploadLyrics}
                onChangeText={setUploadLyrics}
              />

              {/* Nút gửi */}
              <TouchableOpacity
                disabled={uploading}
                style={[styles.primaryButton, uploading && { opacity: 0.6 }]}
                onPress={handlePublishSong}>
                {uploading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Phát hành bài hát lên Songs</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* MODAL YÊU CẦU RÚT TIỀN */}
      <Modal
        visible={payoutModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPayoutModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yêu cầu Rút Doanh thu</Text>
              <TouchableOpacity onPress={() => setPayoutModalVisible(false)}>
                <Ionicons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {payoutNotice ? (
              <View
                style={[
                  styles.alertBox,
                  payoutNotice.type === 'error' ? styles.alertBoxError : styles.alertBoxSuccess,
                ]}>
                <Text
                  style={
                    payoutNotice.type === 'error' ? styles.alertTextError : styles.alertTextSuccess
                  }>
                  {payoutNotice.message}
                </Text>
              </View>
            ) : null}

            <Text style={styles.inputLabel}>Số tiền muốn rút (VNĐ)</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số tiền..."
              placeholderTextColor="#64748B"
              keyboardType="numeric"
              value={payoutAmount}
              onChangeText={setPayoutAmount}
            />

            <Text style={styles.inputLabel}>Ngân hàng thụ hưởng</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: MB Bank, Vietcombank, Techcombank..."
              placeholderTextColor="#64748B"
              value={bankName}
              onChangeText={setBankName}
            />

            <Text style={styles.inputLabel}>Số tài khoản</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số tài khoản ngân hàng"
              placeholderTextColor="#64748B"
              keyboardType="numeric"
              value={accountNumber}
              onChangeText={setAccountNumber}
            />

            <Text style={styles.inputLabel}>Tên chủ tài khoản (không dấu)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: NGUYEN VAN A"
              placeholderTextColor="#64748B"
              autoCapitalize="characters"
              value={accountHolder}
              onChangeText={setAccountHolder}
            />

            <TouchableOpacity
              disabled={payoutSubmitting}
              style={[styles.primaryButton, payoutSubmitting && { opacity: 0.6 }]}
              onPress={handleRequestPayout}>
              {payoutSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Xác nhận rút tiền</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL CHỈNH SỬA HỒ SƠ NGHỆ SĨ */}
      <Modal
        visible={editProfileModal}
        transparent
        animationType="slide"
        onRequestClose={() => setEditProfileModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa Hồ sơ Nghệ sĩ</Text>
              <TouchableOpacity onPress={() => setEditProfileModal(false)}>
                <Ionicons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Tên nghệ danh *</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Tên nghệ danh hiển thị"
              placeholderTextColor="#64748B"
            />

            <Text style={styles.inputLabel}>Link Ảnh đại diện (Avatar URL)</Text>
            <TextInput
              style={styles.input}
              value={editAvatar}
              onChangeText={setEditAvatar}
              placeholder="https://example.com/avatar.jpg"
              placeholderTextColor="#64748B"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Tiểu sử (Bio)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editBio}
              onChangeText={setEditBio}
              placeholder="Giới thiệu về phong cách âm nhạc của bạn..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity
              disabled={savingProfile}
              style={[styles.primaryButton, savingProfile && { opacity: 0.6 }]}
              onPress={handleSaveProfile}>
              {savingProfile ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Lưu thay đổi</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Footer actions={footerActions} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#020817',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020817',
  },
  unauthCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginHorizontal: 20,
  },
  unauthTitle: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  unauthDesc: {
    color: '#94A3B8',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  upgradeContainer: {
    padding: 24,
    alignItems: 'center',
  },
  upgradeHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  upgradeTitle: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  upgradeSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 400,
  },
  perkList: {
    width: '100%',
    maxWidth: 480,
    gap: 16,
    marginBottom: 36,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#0F172A',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 14,
  },
  perkText: {
    flex: 1,
  },
  perkTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  perkDesc: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
  },
  headerEditBtn: {
    padding: 8,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    marginRight: 4,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 16,
  },
  artistAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#1E293B',
  },
  artistInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  artistName: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    color: '#A78BFA',
    fontSize: 11,
    fontWeight: '600',
  },
  artistBio: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },
  artistMeta: {
    color: '#64748B',
    fontSize: 12,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0B1120',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabItemActive: {
    backgroundColor: '#1E293B',
  },
  tabItemText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  tabItemTextActive: {
    color: '#A78BFA',
    fontWeight: '700',
  },
  tabContent: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 14,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 6,
  },
  statValue: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  statSub: {
    color: '#64748B',
    fontSize: 11,
  },
  payoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1B4B',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3730A3',
    marginBottom: 20,
  },
  payoutTitle: {
    color: '#C7D2FE',
    fontSize: 13,
    marginBottom: 4,
  },
  payoutBalance: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
  },
  payoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  payoutButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  tableCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  tableRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  tableCover: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  tableInfo: {
    flex: 1,
  },
  tableSongTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  tableSongDate: {
    color: '#64748B',
    fontSize: 11,
  },
  tableStats: {
    alignItems: 'flex-end',
  },
  tablePlays: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 2,
  },
  tableRevenue: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '700',
  },
  songsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  addSongBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addSongBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 10,
    gap: 12,
  },
  songCover: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#1E293B',
  },
  songDetails: {
    flex: 1,
  },
  songTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  songGenre: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 6,
  },
  songStatBadgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badgePlay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  badgeMoney: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  badgeText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  songActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCircleBtnActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginVertical: 12,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  uploadCard: {
    backgroundColor: '#0F172A',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  uploadTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  uploadDesc: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 18,
  },
  inputLabel: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#020817',
    color: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 14,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  coverPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
    backgroundColor: '#020817',
    padding: 8,
    borderRadius: 10,
  },
  coverPreview: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  coverPreviewText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  genreTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 6,
  },
  genreTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  genreTagActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#A78BFA',
  },
  genreTagText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  genreTagTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  secondaryButtonText: {
    color: '#A78BFA',
    fontSize: 13,
    fontWeight: '700',
  },
  alertBox: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  alertBoxError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  alertTextError: {
    color: '#FDA4AF',
    fontSize: 13,
  },
  alertBoxSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  alertTextSuccess: {
    color: '#6EE7B7',
    fontSize: 13,
    fontWeight: '600',
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
    maxWidth: 440,
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
});
