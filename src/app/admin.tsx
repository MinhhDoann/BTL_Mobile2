import { AdminStatCard } from '@/src/components/admin/AdminStatCard';
import { ManagementForm } from '@/src/components/admin/ManagementForm';
import { SongForm } from '@/src/components/admin/SongForm';
import { AppHeader } from '@/src/components/ui/app-header';
import { Footer } from '@/src/components/ui/footer';
import { useFooterActions } from '@/src/constants/footer-actions';
import {
    createAlbum,
    createArtist,
    createGenre,
    createSong,
    fetchAdminDashboard,
} from '@/src/lib/api/admin-api';
import { AdminDashboardData, CreateSongInput } from '@/src/types/admin';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View,
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

export default function AdminScreen() {
  const router = useRouter();
  const footerActions = useFooterActions('admin');
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittingEntity, setSubmittingEntity] = useState<'song' | 'artist' | 'album' | 'genre' | null>(null);
  const [form, setForm] = useState<CreateSongInput>(defaultForm);
  const [artistForm, setArtistForm] = useState({ name: '', bio: '', avatar_url: '' });
  const [albumForm, setAlbumForm] = useState({ title: '', artist_id: '', cover_url: '', release_date: '' });
  const [genreForm, setGenreForm] = useState({ name: '' });

  const loadDashboard = async () => {
    try {
      const data = await fetchAdminDashboard();
      setDashboard(data);
      if (data.artists.length && !form.artist_id) {
        setForm((prev) => ({ ...prev, artist_id: String(data.artists[0].artist_id) }));
      }
    } catch (error) {
      Alert.alert('Lỗi', error instanceof Error ? error.message : 'Không thể tải dữ liệu admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

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
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên bài hát, nghệ sĩ, thời lượng và audio URL.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmittingEntity('song');
      await createSong(form);
      Alert.alert('Thành công', 'Bài hát đã được đăng lên hệ thống.');
      setForm({ ...defaultForm, artist_id: dashboard?.artists[0] ? String(dashboard.artists[0].artist_id) : '' });
      await loadDashboard();
    } catch (error) {
      Alert.alert('Lỗi đăng bài', error instanceof Error ? error.message : 'Không thể đăng bài');
    } finally {
      setSubmitting(false);
      setSubmittingEntity(null);
    }
  };

  const handleCreateArtist = async () => {
    if (!artistForm.name.trim()) {
      Alert.alert('Thiếu thông tin', 'Tên nghệ sĩ không được để trống.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmittingEntity('artist');
      await createArtist(artistForm);
      Alert.alert('Thành công', 'Nghệ sĩ đã được thêm.');
      setArtistForm({ name: '', bio: '', avatar_url: '' });
      await loadDashboard();
    } catch (error) {
      Alert.alert('Lỗi', error instanceof Error ? error.message : 'Không thể thêm nghệ sĩ');
    } finally {
      setSubmitting(false);
      setSubmittingEntity(null);
    }
  };

  const handleCreateAlbum = async () => {
    if (!albumForm.title.trim() || !albumForm.artist_id.trim()) {
      Alert.alert('Thiếu thông tin', 'Tên album và nghệ sĩ là bắt buộc.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmittingEntity('album');
      await createAlbum({
        title: albumForm.title,
        artist_id: Number(albumForm.artist_id),
        cover_url: albumForm.cover_url,
        release_date: albumForm.release_date,
      });
      Alert.alert('Thành công', 'Album đã được thêm.');
      setAlbumForm({ title: '', artist_id: '', cover_url: '', release_date: '' });
      await loadDashboard();
    } catch (error) {
      Alert.alert('Lỗi', error instanceof Error ? error.message : 'Không thể thêm album');
    } finally {
      setSubmitting(false);
      setSubmittingEntity(null);
    }
  };

  const handleCreateGenre = async () => {
    if (!genreForm.name.trim()) {
      Alert.alert('Thiếu thông tin', 'Tên thể loại không được để trống.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmittingEntity('genre');
      await createGenre({ name: genreForm.name });
      Alert.alert('Thành công', 'Thể loại đã được thêm.');
      setGenreForm({ name: '' });
      await loadDashboard();
    } catch (error) {
      Alert.alert('Lỗi', error instanceof Error ? error.message : 'Không thể thêm thể loại');
    } finally {
      setSubmitting(false);
      setSubmittingEntity(null);
    }
  };

  if (loading || !dashboard) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A78BFA" />
          <Text style={styles.loadingText}>Đang tải dữ liệu quản trị...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <AppHeader title="Quản trị" onBackPress={() => router.back()} />

        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
          <Text style={styles.heading}>Bảng điều khiển</Text>

          <View style={styles.statsGrid}>
            <AdminStatCard label="Người dùng" value={dashboard.stats.users_count} accent="#8B5CF6" />
            <AdminStatCard label="Nghệ sĩ" value={dashboard.stats.artists_count} accent="#22C55E" />
            <AdminStatCard label="Bài hát" value={dashboard.stats.songs_count} accent="#F59E0B" />
            <AdminStatCard label="Lượt nghe" value={dashboard.stats.total_plays} accent="#38BDF8" />
          </View>

          <SongForm
            artists={dashboard.artists}
            genres={dashboard.genres}
            value={form}
            submitting={submitting && submittingEntity === 'song'}
            onChange={handleFieldChange}
            onToggleGenre={handleToggleGenre}
            onSubmit={handleSubmit}
          />

          <ManagementForm
            title="Thêm nghệ sĩ mới"
            fields={[
              { key: 'name', label: 'Tên nghệ sĩ', placeholder: 'Ví dụ: Hoàng Dũng', value: artistForm.name },
              { key: 'bio', label: 'Tiểu sử', placeholder: 'Mô tả ngắn về nghệ sĩ', value: artistForm.bio, multiline: true },
              { key: 'avatar_url', label: 'Avatar URL', placeholder: 'https://...', value: artistForm.avatar_url },
            ]}
            submitLabel="Thêm nghệ sĩ"
            submitting={submitting && submittingEntity === 'artist'}
            onChange={(key, value) => setArtistForm((prev) => ({ ...prev, [key]: value }))}
            onSubmit={handleCreateArtist}
          />

          <ManagementForm
            title="Thêm album mới"
            fields={[
              { key: 'title', label: 'Tên album', placeholder: 'Ví dụ: Tết yêu thương', value: albumForm.title },
              { key: 'artist_id', label: 'Mã nghệ sĩ', placeholder: 'Ví dụ: 1', value: albumForm.artist_id, keyboardType: 'numeric' },
              { key: 'cover_url', label: 'Cover URL', placeholder: 'https://...', value: albumForm.cover_url },
              { key: 'release_date', label: 'Ngày phát hành', placeholder: 'YYYY-MM-DD', value: albumForm.release_date },
            ]}
            submitLabel="Thêm album"
            submitting={submitting && submittingEntity === 'album'}
            onChange={(key, value) => setAlbumForm((prev) => ({ ...prev, [key]: value }))}
            onSubmit={handleCreateAlbum}
          />

          <ManagementForm
            title="Thêm thể loại nhạc"
            fields={[
              { key: 'name', label: 'Tên thể loại', placeholder: 'Ví dụ: Acoustic', value: genreForm.name },
            ]}
            submitLabel="Thêm thể loại"
            submitting={submitting && submittingEntity === 'genre'}
            onChange={(key, value) => setGenreForm((prev) => ({ ...prev, [key]: value }))}
            onSubmit={handleCreateGenre}
          />

          <View style={styles.card}>
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
          </View>
        </ScrollView>

        <Footer actions={footerActions} />
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
  },
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
    paddingBottom: 20,
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
