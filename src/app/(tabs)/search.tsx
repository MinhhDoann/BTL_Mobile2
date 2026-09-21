import { AppHeader } from '@/src/components/ui/app-header';
import { Footer } from '@/src/components/ui/footer';
import { useFooterActions } from '@/src/constants/footer-actions';
import { getCoverUrl } from '@/src/lib/cover-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const genres = ['Tất cả', 'Pop', 'R&B', 'Rock', 'Indie', 'Hip Hop', 'Acoustic'];

const trending = [
  { id: 1, title: 'Lofi Chill', color: '#7C3AED' },
  { id: 2, title: 'Nhạc Việt', color: '#F97316' },
  { id: 3, title: 'Chill', color: '#22C55E' },
  { id: 4, title: 'Workout', color: '#38BDF8' },
];

type SongItem = {
  id: number;
  title: string;
  artist: string;
  cover: string;
};

import { detectApiBase } from '@/src/lib/api/detectApi';

export default function SearchScreen() {
  const router = useRouter();
  const footerActions = useFooterActions('search');
  const [search, setSearch] = useState('');
  const [activeGenre, setActiveGenre] = useState('Tất cả');
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const base = await detectApiBase();
        const response = await fetch(`${base}/api/home-data`);
        const data = await response.json();

        const normalized: SongItem[] = [];
        data.forEach((genre: any) => {
          (genre.songs || []).forEach((song: any) => {
            normalized.push({
              id: song.song_id,
              title: song.title,
              artist: song.artist_name || 'Unknown artist',
              cover: getCoverUrl(song.cover_url),
            });
          });
        });

        setSongs(normalized);
      } catch (error) {
        console.error('Lỗi lấy dữ liệu tìm kiếm:', error);
        setSongs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  const filteredSongs = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword && activeGenre === 'Tất cả') return songs;

    return songs.filter((song) => {
      const matchesKeyword =
        !keyword ||
        song.title.toLowerCase().includes(keyword) ||
        song.artist.toLowerCase().includes(keyword);

      const matchesGenre =
        activeGenre === 'Tất cả' ||
        (activeGenre === 'Pop' && song.artist.toLowerCase().includes('top')) ||
        (activeGenre === 'R&B' && song.title.toLowerCase().includes('say')) ||
        (activeGenre === 'Rock' && song.title.toLowerCase().includes('dancing')) ||
        (activeGenre === 'Indie' && song.title.toLowerCase().includes('em')) ||
        (activeGenre === 'Hip Hop' && song.artist.toLowerCase().includes('m-tp')) ||
        (activeGenre === 'Acoustic' && song.title.toLowerCase().includes('buồn'));

      return matchesKeyword && matchesGenre;
    });
  }, [search, activeGenre, songs]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <AppHeader title="Tìm kiếm" onBackPress={() => console.log('Back')} />

        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
          <View style={styles.searchWrap}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
              placeholder="Bạn muốn nghe gì hôm nay?"
              placeholderTextColor="#64748B"
            />
          </View>

          <Text style={styles.sectionTitle}>Thể loại</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreList}>
            {genres.map((genre) => (
              <TouchableOpacity
                key={genre}
                onPress={() => setActiveGenre(genre)}
                style={[styles.genreChip, activeGenre === genre && styles.genreChipActive]}
              >
                <Text style={[styles.genreText, activeGenre === genre && styles.genreTextActive]}>{genre}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Xu hướng</Text>
          <View style={styles.trendingGrid}>
            {trending.map((item) => (
              <TouchableOpacity key={item.id} style={[styles.trendCard, { backgroundColor: item.color }]}>
                <Text style={styles.trendText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.resultHeader}>
            <Text style={styles.sectionTitle}>Kết quả</Text>
            <Text style={styles.resultCount}>{filteredSongs.length} bài hát</Text>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#A78BFA" />
              <Text style={styles.emptyText}>Đang tải nhạc...</Text>
            </View>
          ) : filteredSongs.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Không tìm thấy bài hát phù hợp.</Text>
            </View>
          ) : (
            <View style={styles.songList}>
              {filteredSongs.map((song) => (
                <TouchableOpacity
                  key={song.id}
                  style={styles.songRow}
                  activeOpacity={0.8}
                  onPress={() => router.push({ pathname: '/song-detail', params: { songId: String(song.id) } })}
                >
                  <Image source={{ uri: song.cover }} style={styles.cover} />
                  <View style={styles.songInfo}>
                    <Text style={styles.songTitle}>{song.title}</Text>
                    <Text style={styles.songArtist}>{song.artist}</Text>
                  </View>
                  <Text style={styles.playIcon}>▶</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <Footer actions={footerActions} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B1120' },
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 16 },
  contentInner: { paddingBottom: 24 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    paddingHorizontal: 14,
    marginTop: 14,
    marginBottom: 18,
  },
  searchIcon: {
    color: '#94A3B8',
    fontSize: 20,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: '#FFFFFF',
    fontSize: 15,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  genreList: {
    paddingBottom: 6,
    gap: 10,
  },
  genreChip: {
    backgroundColor: '#111827',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginRight: 10,
  },
  genreChipActive: {
    backgroundColor: '#A78BFA',
    borderColor: '#A78BFA',
  },
  genreText: {
    color: '#E2E8F0',
    fontWeight: '600',
    fontSize: 13,
  },
  genreTextActive: {
    color: '#0F172A',
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  trendCard: {
    width: '48%',
    minHeight: 92,
    borderRadius: 18,
    justifyContent: 'flex-end',
    padding: 14,
    marginBottom: 12,
  },
  trendText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultCount: {
    color: '#94A3B8',
    fontSize: 12,
  },
  loadingBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1F2937',
    flexDirection: 'row',
    gap: 12,
  },
  emptyBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  songList: {
    gap: 12,
  },
  songRow: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cover: {
    width: 58,
    height: 58,
    borderRadius: 12,
    backgroundColor: '#1E293B',
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
  },
  songTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  songArtist: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  playIcon: {
    color: '#A78BFA',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
});
