import { AppHeader } from '@/src/components/ui/app-header';
import { Footer } from '@/src/components/ui/footer';
import { useFooterActions } from '@/src/constants/footer-actions';
import { detectApiBase } from '@/src/lib/api/detectApi';
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
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DEFAULT_GENRES = ['Tất cả', 'Pop', 'R&B', 'Ballad', 'Hip-Hop/Rap', 'Indie', 'Rock', 'Lofi'];

const trending = [
  { id: 'trend-lofi', title: 'Lofi Chill', color: '#7C3AED', keyword: 'Lofi' },
  { id: 'trend-viet', title: 'Nhạc Trẻ', color: '#F97316', keyword: 'Pop' },
  { id: 'trend-rb', title: 'R&B', color: '#22C55E', keyword: 'R&B' },
  { id: 'trend-ballad', title: 'Ballad', color: '#38BDF8', keyword: 'Ballad' },
];

type SongItem = {
  id: number;
  title: string;
  artist: string;
  cover: string;
  genres: string[];
};

export default function SearchScreen() {
  const router = useRouter();
  const footerActions = useFooterActions('search');
  const [search, setSearch] = useState('');
  const [activeGenre, setActiveGenre] = useState('Tất cả');
  const [genresList, setGenresList] = useState<string[]>(DEFAULT_GENRES);
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchSongs = async () => {
      try {
        const base = await detectApiBase();
        const response = await fetch(`${base}/api/home-data`);
        const data = await response.json();

        if (!Array.isArray(data)) {
          if (isMounted) setSongs([]);
          return;
        }

        // Deduplicate songs by song_id and collect genres for each song
        const songMap = new Map<number, SongItem>();
        const dynamicGenres = new Set<string>();

        data.forEach((genre: any) => {
          const genreName = (genre.genre_name || '').trim();
          if (genreName && genreName !== 'Khác') {
            dynamicGenres.add(genreName);
          }

          (genre.songs || []).forEach((song: any) => {
            if (!song || !song.song_id) return;
            const songId = Number(song.song_id);
            const existing = songMap.get(songId);

            if (existing) {
              if (genreName && !existing.genres.includes(genreName)) {
                existing.genres.push(genreName);
              }
            } else {
              songMap.set(songId, {
                id: songId,
                title: song.title || '',
                artist: song.artist_name || 'Unknown artist',
                cover: getCoverUrl(song.cover_url),
                genres: genreName ? [genreName] : [],
              });
            }
          });
        });

        if (isMounted) {
          setSongs(Array.from(songMap.values()));
          if (dynamicGenres.size > 0) {
            const mergedGenres = ['Tất cả', ...Array.from(new Set([...DEFAULT_GENRES.slice(1), ...dynamicGenres]))];
            setGenresList(mergedGenres);
          }
        }
      } catch (error) {
        console.error('Lỗi lấy dữ liệu tìm kiếm:', error);
        if (isMounted) setSongs([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSongs();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredSongs = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return songs.filter((song) => {
      const matchesKeyword =
        !keyword ||
        song.title.toLowerCase().includes(keyword) ||
        song.artist.toLowerCase().includes(keyword) ||
        song.genres.some((g) => g.toLowerCase().includes(keyword));

      const matchesGenre =
        activeGenre === 'Tất cả' ||
        song.genres.some((g) => {
          const gNorm = g.toLowerCase().replace(/[^a-z0-9]/g, '');
          const activeNorm = activeGenre.toLowerCase().replace(/[^a-z0-9]/g, '');
          return gNorm.includes(activeNorm) || activeNorm.includes(gNorm);
        });

      return matchesKeyword && matchesGenre;
    });
  }, [search, activeGenre, songs]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <AppHeader title="Tìm kiếm" onBackPress={() => router.back()} />

        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} keyboardShouldPersistTaps="handled">
          <View style={styles.searchWrap}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
              placeholder="Bạn muốn nghe gì hôm nay?"
              placeholderTextColor="#64748B"
              autoCorrect={false}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearch('')}
                hitSlop={10}
                style={styles.clearBtn}
                accessibilityLabel="Xóa tìm kiếm"
              >
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.sectionTitle}>Thể loại</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreList}>
            {genresList.map((genre) => (
              <TouchableOpacity
                key={`genre-${genre}`}
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
              <TouchableOpacity
                key={item.id}
                style={[styles.trendCard, { backgroundColor: item.color }]}
                activeOpacity={0.8}
                onPress={() => {
                  setSearch(item.keyword);
                }}
              >
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
                  key={`song-${song.id}`}
                  style={styles.songRow}
                  activeOpacity={0.8}
                  onPress={() => router.push({ pathname: '/song-detail', params: { songId: String(song.id) } })}
                >
                  <Image source={{ uri: song.cover }} style={styles.cover} />
                  <View style={styles.songInfo}>
                    <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
                    <Text style={styles.songArtist} numberOfLines={1}>{song.artist}</Text>
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
  clearBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIcon: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
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
