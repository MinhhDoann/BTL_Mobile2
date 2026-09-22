import { AppHeader } from '@/src/components/ui/app-header';
import { Footer } from '@/src/components/ui/footer';
import { useFooterActions } from '@/src/constants/footer-actions';
import { detectApiBase } from '@/src/lib/api/detectApi';
import { audioPlayer } from '@/src/lib/audio-player';
import { getCoverUrl } from '@/src/lib/cover-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image, Platform, ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Song {
  song_id: number;
  title: string;
  artist_name: string;
  cover_url: string;
  audio_url: string;
}
interface GenreWithSongs {
  genre_id: number;
  genre_name: string;
  songs: Song[];
}

export default function HomeScreen() {
  const router = useRouter();
  const footerActions = useFooterActions('home');
  const [tab, setTab] = useState<'all' | 'music' | 'podcast'>('all');

  // State lưu danh sách dữ liệu từ CSDL
  const [genresData, setGenresData] = useState<GenreWithSongs[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [playingSongId, setPlayingSongId] = useState<number | null>(null);

  // Gọi API lấy danh sách thể loại và bài hát khi mở màn hình
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const base = await detectApiBase();
        if (!mounted) return;
        await fetchDataFromMySQL(base);
      } catch (e) {
        console.error('[Home] detectApiBase error', e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const fetchDataFromMySQL = async (base: string) => {
    const url = `${base}/api/home-data`;
    try {
      setLoading(true);
      console.log('[Home] fetching', url);
      const response = await fetch(url);
      console.log('[Home] response status', response.status);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      console.log('[Home] fetched items', Array.isArray(data) ? data.length : typeof data);
      setGenresData(data || []);
    } catch (error) {
      console.error('Lỗi lấy dữ liệu từ MySQL:', error);
      setGenresData([]);
    } finally {
      setLoading(false);
    }
  };

  // Component render từng card bài hát theo hàng ngang (render dynamic itemWidth below)

  useEffect(() => {
    const unsubscribe = audioPlayer.subscribe((state) => {
      setPlayingSongId(state.songId);
    });

    return unsubscribe;
  }, []);

  const playSong = async (song: Song) => {
    await audioPlayer.playTrack({ songId: song.song_id, audioUrl: song.audio_url });
  };

  const isWeb = Platform.OS === 'web';
  const defaultItemsPerSection = isWeb ? 8 : 4;

  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  useEffect(() => {
    const sub = Dimensions.addEventListener?.('change', ({ window }) => setScreenWidth(window.width));
    return () => sub?.remove?.();
  }, []);

  const itemsPerSection = defaultItemsPerSection;
  const horizPadding = 16 * 2; // scrollArea paddingHorizontal * 2
  const gap = 12; // gap between items
  const itemWidth = Math.max(96, Math.floor((screenWidth - horizPadding - gap * (itemsPerSection - 1)) / itemsPerSection));

  const [expanded, setExpanded] = useState<{ trending: boolean; recent: boolean }>({ trending: false, recent: false });
  // Aggregate lists memoized to avoid recalculation and duplicate keys
  const allSongs = useMemo(() => {
    const map = new Map<number, Song>();
    for (const g of genresData) {
      for (const s of g.songs || []) {
        if (!map.has(s.song_id)) {
          map.set(s.song_id, s);
        }
      }
    }
    return Array.from(map.values());
  }, [genresData]);
  const trendingList = useMemo(() => allSongs, [allSongs]);
  const recentList = useMemo(() => [...allSongs].sort((a, b) => b.song_id - a.song_id), [allSongs]);

  const onPressSong = useCallback((songId: number) => {
    router.push({ pathname: '/song-detail', params: { songId: String(songId) } });
  }, [router]);

  const SongCard = useCallback(({ item }: { item: Song }) => {
    return (
      <TouchableOpacity
        style={[styles.songCard, { width: itemWidth, marginRight: 12 }]}
        onPress={() => onPressSong(item.song_id)}
      >
        <View style={[styles.thumbWrap, { width: itemWidth, height: itemWidth }]}>
          <Image
            source={{ uri: getCoverUrl(item.cover_url) }}
            style={[styles.coverImage, { width: itemWidth, height: itemWidth }]}
          />
          {playingSongId === item.song_id ? <View style={styles.playingDot} /> : null}
        </View>

        <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.artistName} numberOfLines={1}>{item.artist_name}</Text>
      </TouchableOpacity>
    );
  }, [itemWidth, onPressSong, playingSongId]);


  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <AppHeader title="Trang Chủ" onBackPress={() => console.log('Back')} />

        <View style={styles.content}>
          {/* Thanh Menu chọn Tab */}
          <View style={styles.menuContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.menu}>
              <TouchableOpacity onPress={() => setTab('all')} style={[styles.chip, tab === 'all' && styles.chipActive]}>
                <Text style={[styles.chipText, tab === 'all' && styles.chipTextActive]}>Tất cả</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setTab('music')} style={[styles.chip, tab === 'music' && styles.chipActive]}>
                <Text style={[styles.chipText, tab === 'music' && styles.chipTextActive]}>Nhạc</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setTab('podcast')} style={[styles.chip, tab === 'podcast' && styles.chipActive]}>
                <Text style={[styles.chipText, tab === 'podcast' && styles.chipTextActive]}>Podcasts</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Nội dung danh sách bài hát */}
          {loading ? (
            <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 40 }} />
          ) : (
            <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 20 }}>
              {!loading && genresData.length === 0 && (
                <View style={{ padding: 16 }}>
                  <Text style={{ color: '#fff', marginBottom: 8 }}>Không có dữ liệu hiển thị trên thiết bị này.</Text>
                  <Text style={{ color: '#94A3B8', fontSize: 13 }}>
                    Thử các bước:
                  </Text>
                  <Text style={{ color: '#94A3B8', fontSize: 13 }}>• Kiểm tra server backend có đang chạy và lắng nghe trên host đúng (0.0.0.0 hoặc IP máy).
                  </Text>
                  <Text style={{ color: '#94A3B8', fontSize: 13 }}>• Với Android emulator dùng 10.0.2.2:{'3000'} hoặc Genymotion dùng 10.0.3.2.
                  </Text>
                  <Text style={{ color: '#94A3B8', fontSize: 13 }}>• Với thiết bị thật, dùng IP máy dev (ví dụ 192.168.x.y:3000) và đảm bảo cùng mạng Wi‑Fi.
                  </Text>
                  <Text style={{ color: '#94A3B8', fontSize: 13 }}>• Mở DevTools/console để xem các log fetch (tìm '[Home] fetching').
                  </Text>
                </View>
              )}
              {tab === 'all' && (
                <View>
                  {/* Lặp qua từng Thể loại lấy từ CSDL MySQL */}
                  {genresData.map((genre) => (
                    <View key={genre.genre_id} style={styles.sectionContainer}>
                      <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{genre.genre_name}</Text>
                        <TouchableOpacity style={styles.seeAll} onPress={() => console.log('See all', genre.genre_name)}>
                          <Text style={styles.seeAllText}>Xem tất cả</Text>
                        </TouchableOpacity>
                      </View>

                      <FlatList
                        data={genre.songs}
                        renderItem={({ item }) => <SongCard item={item} />}
                        keyExtractor={(item) => item.song_id.toString()}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalList}
                      />
                    </View>
                  ))}
                </View>
              )}

              {tab === 'music' && (
                <View>
                  {/* Thịnh hành (aggregated across genres) */}
                  <Text style={[styles.sectionTitle, { marginTop: 6 }]}>Thịnh hành</Text>
                  {(() => {
                    const list = expanded.trending ? trendingList : trendingList.slice(0, itemsPerSection);

                    return (
                      <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                          <View />
                          {trendingList.length > itemsPerSection && (
                            <TouchableOpacity onPress={() => setExpanded((s) => ({ ...s, trending: !s.trending }))} style={styles.seeAll}>
                              <Text style={styles.seeAllText}>{expanded.trending ? 'Thu gọn' : 'Xem thêm'}</Text>
                            </TouchableOpacity>
                          )}
                        </View>

                        <FlatList
                          data={list}
                          renderItem={SongCard}
                          keyExtractor={(item) => `tr-${item.song_id}`}
                          horizontal={true}
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.horizontalList}
                          initialNumToRender={Math.min(itemsPerSection, list.length)}
                          maxToRenderPerBatch={Math.min(itemsPerSection * 2, list.length)}
                          windowSize={5}
                          removeClippedSubviews={true}
                          getItemLayout={(_, index) => ({ length: itemWidth + 12, offset: (itemWidth + 12) * index, index })}
                        />
                      </View>
                    );
                  })()}

                  {/* Mới (aggregated and sorted by newest) */}
                  <Text style={[styles.sectionTitle, { marginTop: 6 }]}>Mới</Text>
                  {(() => {
                    const list = expanded.recent ? recentList : recentList.slice(0, itemsPerSection);

                    return (
                      <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                          <View />
                          {recentList.length > itemsPerSection && (
                            <TouchableOpacity onPress={() => setExpanded((s) => ({ ...s, recent: !s.recent }))} style={styles.seeAll}>
                              <Text style={styles.seeAllText}>{expanded.recent ? 'Thu gọn' : 'Xem thêm'}</Text>
                            </TouchableOpacity>
                          )}
                        </View>

                        <FlatList
                          data={list}
                          renderItem={SongCard}
                          keyExtractor={(item) => `new-${item.song_id}`}
                          horizontal={true}
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.horizontalList}
                          initialNumToRender={Math.min(itemsPerSection, list.length)}
                          maxToRenderPerBatch={Math.min(itemsPerSection * 2, list.length)}
                          windowSize={5}
                          removeClippedSubviews={true}
                          getItemLayout={(_, index) => ({ length: itemWidth + 12, offset: (itemWidth + 12) * index, index })}
                        />
                      </View>
                    );
                  })()}
                </View>
              )}

              {tab === 'podcast' && <Text style={styles.placeholder}>Danh sách Podcasts</Text>}
            </ScrollView>
          )}
        </View>

        <Footer actions={footerActions} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B1120' },
  container: { flex: 1 },
  content: { flex: 1 },
  menuContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menu: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#FFFFFF',
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#0B1120',
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  podcastGroup: {},
  chipSmall: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    marginRight: 8,
  },
  chipActiveSmall: {
    backgroundColor: '#FFFFFF',
  },
  chipTextSmall: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextActiveSmall: {
    color: '#0B1120',
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12
  },
  // Style cho Card bài hát cuộn ngang
  songCard: {
    width: 120,
  },
  coverImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    marginBottom: 6,
  },
  songTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  artistName: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  placeholder: { color: '#94A3B8', padding: 8 },
  playingDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: '#4EA8FF',
    position: 'absolute',
    top: 6,
    right: 6,
  },
  thumbWrap: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#0F1724',
    marginBottom: 8,
    elevation: 2,
  },
  horizontalList: {
    paddingVertical: 4,
    paddingRight: 8,
    gap: 12,
    paddingLeft: 0,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  seeAll: { paddingHorizontal: 8, paddingVertical: 4 },
  seeAllText: { color: '#94A3B8', fontSize: 13 },
});
