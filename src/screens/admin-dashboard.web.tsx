import { AdminStatCard } from '@/src/components/admin/AdminStatCard';
import { AdminDataTable } from '@/src/components/admin/AdminDataTable.web';
import { ADMIN_ENTITIES } from '@/src/constants/admin-entities';
import { SongForm } from '@/src/components/admin/SongForm';
import { AppHeader } from '@/src/components/ui/app-header';
import { useAuth } from '@/src/contexts/auth';
import {
    createSong,
    fetchAdminDashboard,
} from '@/src/lib/api/admin-api';
import { AdminDashboardData, AdminEntity, CreateSongInput } from '@/src/types/admin';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const defaultForm: CreateSongInput = {
  title: '',
  artist_id: '',
  album_id: '',
  duration: '',
  audio_url: '',
  cover_url: '',
  lyrics: '',
  genres: [],
};

export default function AdminDashboard() {
  const showNotice = (title: string, message: string) => setNotice(title + ': ' + message);
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const [section, setSection] = useState<'overview' | 'song' | AdminEntity>('overview');
  const [notice, setNotice] = useState('');
  const [loadError, setLoadError] = useState('');
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittingEntity, setSubmittingEntity] = useState<'song' | 'artist' | 'album' | 'genre' | null>(null);
  const [form, setForm] = useState<CreateSongInput>(defaultForm);

  const loadDashboard = useCallback(async () => {
    setLoadError('');
    try {
      const data = await fetchAdminDashboard();
      setDashboard(data);
      if (data.artists.length) {
        setForm((prev) => prev.artist_id ? prev : ({ ...prev, artist_id: String(data.artists[0].artist_id) }));
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Không thể tải dữ liệu quản trị');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleFieldChange = (field: keyof CreateSongInput, value: string | number[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleGenre = (genreId: number) => {
    setForm((prev) => {
      const alreadySelected = prev.genres.includes(genreId);
      return {
        ...prev,
        genres: alreadySelected ? prev.genres.filter((id) => id !== genreId) : [...prev.genres, genreId],
      };
    });
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.artist_id || !form.duration || !form.audio_url.trim()) {
      showNotice('Thiếu thông tin', 'Vui lòng nhập tên bài hát, nghệ sĩ, thời lượng và audio URL.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmittingEntity('song');
      await createSong(form);
      showNotice('Thành công', 'Bài hát đã được đăng lên hệ thống.');
      setForm({ ...defaultForm, artist_id: dashboard?.artists[0] ? String(dashboard.artists[0].artist_id) : '' });
      await loadDashboard();
    } catch (error) {
      showNotice('Lỗi đăng bài', error instanceof Error ? error.message : 'Không thể đăng bài');
    } finally {
      setSubmitting(false);
      setSubmittingEntity(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A78BFA" />
          <Text style={styles.loadingText}>Đang tải dữ liệu quản trị...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!dashboard) return (
    <View style={styles.loadingContainer}>
      <Text accessibilityRole="alert" style={styles.loadingText}>{loadError || 'Không thể tải dữ liệu quản trị.'}</Text>
      <Pressable onPress={() => { setLoading(true); void loadDashboard(); }} style={styles.navItem}><Text style={styles.navText}>Thử lại</Text></Pressable>
      <Pressable onPress={() => router.replace('/')} style={styles.navItem}><Text style={styles.navText}>Về trang chủ</Text></Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={[styles.container, width < 800 && { flexDirection: 'column' }]}>
        <View style={[styles.sidebar, width < 800 && { width: '100%', padding: 12 }]}>
          <Text style={styles.brand}>MOBILE2 / ADMIN</Text>
          <Text style={styles.account}>{user?.username}</Text>
          <View style={width < 800 ? { flexDirection: 'row', flexWrap: 'wrap' } : undefined}>
            {([
              ['overview', 'Tổng quan'], ['song', 'Đăng bài hát'], ['users', 'Người dùng'], ['songs', 'Bài hát'], ['artists', 'Nghệ sĩ'], ['albums', 'Album'], ['genres', 'Thể loại'], ['playlists', 'Playlist'],
            ] as const).map(([key, label]) => (
              <Pressable key={key} accessibilityRole="button" accessibilityState={{ selected: section === key }} onPress={() => { setSection(key); setNotice(''); }} style={[styles.navItem, section === key && styles.navActive]}>
                <Text style={styles.navText}>{label}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={() => router.replace('/')} style={styles.navItem}><Text style={styles.account}>← Về trang nghe nhạc</Text></Pressable>
        </View>
        <View style={styles.main}>
        <AppHeader title="Quản trị hệ thống" />

        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
          <Text style={styles.heading}>{section === 'overview' ? 'Bảng điều khiển' : section === 'song' ? 'Đăng bài hát' : ADMIN_ENTITIES[section].title}</Text>
          {notice || loadError ? <Text accessibilityRole="alert" style={styles.notice}>{notice || loadError}</Text> : null}

          {section === 'overview' && <View style={styles.statsGrid}>
            <AdminStatCard label="Người dùng" value={dashboard.stats.users_count} accent="#8B5CF6" />
            <AdminStatCard label="Nghệ sĩ" value={dashboard.stats.artists_count} accent="#22C55E" />
            <AdminStatCard label="Bài hát" value={dashboard.stats.songs_count} accent="#F59E0B" />
            <AdminStatCard label="Lượt nghe" value={dashboard.stats.total_plays} accent="#38BDF8" />
          </View>}

          {section !== 'overview' && section !== 'song' && <AdminDataTable key={section} entity={section} dashboard={dashboard} currentUserId={user?.user_id} onChanged={loadDashboard} onCreateSong={() => setSection('song')} />}

          {section === 'song' && <SongForm
            artists={dashboard.artists}
            genres={dashboard.genres}
            value={form}
            submitting={submitting && submittingEntity === 'song'}
            onChange={handleFieldChange}
            onToggleGenre={handleToggleGenre}
            onSubmit={handleSubmit}
          />}




          {section === 'overview' && <View style={styles.card}>
            <Text style={styles.cardTitle}>Bài hát mới nhất</Text>
            {dashboard.recentSongs.length === 0 ? (
              <Text style={styles.emptyText}>Chưa có bài hát nào.</Text>
            ) : (
              dashboard.recentSongs.map((song) => (
                <View key={song.song_id} style={styles.songRow}>
                  <View style={styles.songThumbWrap}>
                    {song.cover_url ? (
                      <Text style={styles.songThumbText}>IMG</Text>
                    ) : (
                      <Text style={styles.songThumbText}>♫</Text>
                    )}
                  </View>
                  <View style={styles.songMeta}>
                    <Text style={styles.songTitle}>{song.title}</Text>
                    <Text style={styles.songArtist}>{song.artist_name ?? 'Unknown artist'}</Text>
                    <Text style={styles.songGenre}>{song.genres ?? 'Chưa phân loại'}</Text>
                  </View>
                </View>
              ))
            )}
          </View>}
        </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020817',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  main: { flex: 1, minWidth: 0 },
  sidebar: { width: 240, padding: 24, backgroundColor: '#0B1120', borderRightWidth: 1, borderRightColor: '#1E293B' },
  brand: { color: '#A78BFA', fontSize: 18, fontWeight: '800', marginBottom: 12 },
  account: { color: '#94A3B8', marginBottom: 20 },
  navItem: { padding: 14, borderRadius: 10, marginBottom: 8 },
  navActive: { backgroundColor: '#312E81' },
  navText: { color: '#E2E8F0', fontWeight: '600' },
  notice: { color: '#E2E8F0', padding: 16, backgroundColor: '#1E293B', borderRadius: 10, marginBottom: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020817',
  },
  loadingText: {
    color: '#E2E8F0',
    marginTop: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentInner: {
    padding: 24,
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center',
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 16,
    marginTop: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  songThumbWrap: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  songThumbText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  songMeta: {
    marginLeft: 12,
    flex: 1,
  },
  songTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  songArtist: {
    color: '#A5B4FC',
    fontSize: 12,
    marginTop: 2,
  },
  songGenre: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
});
