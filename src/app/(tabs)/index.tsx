import { AppHeader } from '@/src/components/ui/app-header';
import { Footer } from '@/src/components/ui/footer';
import { useFooterActions } from '@/src/constants/footer-actions';
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
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
  const footerActions = useFooterActions('home');
  const [tab, setTab] = useState<'all' | 'music' | 'podcast'>('all');
  
  // State lưu danh sách dữ liệu từ CSDL
  const [genresData, setGenresData] = useState<GenreWithSongs[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sound, setSound] = useState<any>(null);
  const [playingSongId, setPlayingSongId] = useState<number | null>(null);

  // Gọi API lấy danh sách thể loại và bài hát khi mở màn hình
  useEffect(() => {
    fetchDataFromMySQL();
  }, []);

  const fetchDataFromMySQL = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/home-data'); 
      const data = await response.json();
      setGenresData(data);
    } catch (error) {
      console.error('Lỗi lấy dữ liệu từ MySQL:', error);
    } finally {
      setLoading(false);
    }
  };

  // Component render từng card bài hát theo hàng ngang
  const renderSongItem = ({ item }: { item: Song }) => (
    <TouchableOpacity
      style={styles.songCard}
      onPress={() => playSong(item)}
    >
      <View style={styles.thumbWrap}>
        <Image
          source={{ uri: item.cover_url || 'https://via.placeholder.com/240' }}
          style={styles.coverImage}
        />
        {playingSongId === item.song_id ? <View style={styles.playingDot} /> : null}
      </View>

      <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.artistName} numberOfLines={1}>{item.artist_name}</Text>
    </TouchableOpacity>
  );

  // cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        try {
          sound.unloadAsync();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [sound]);

  // Play a song using Expo Audio
  const playSong = async (song: Song) => {
    try {
      // If same song tapped, toggle pause/play
      if (playingSongId === song.song_id && sound) {
        const status = await sound.getStatusAsync();
        if (status.isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
        return;
      }

      // Unload previous sound
      if (sound) {
        try {
          await sound.unloadAsync();
        } catch (e) {
          // ignore
        }
        setSound(null);
        setPlayingSongId(null);
      }

      // Create new sound and play
      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri: song.audio_url || 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3' },
        { shouldPlay: true }
      );

      setSound(newSound);
      setPlayingSongId(song.song_id);

      // Listen for playback end to clear state
      newSound.setOnPlaybackStatusUpdate((st: any) => {
        if (st.isLoaded && st.didJustFinish) {
          setPlayingSongId(null);
        }
      });
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

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
                        renderItem={renderSongItem}
                        keyExtractor={(item) => item.song_id.toString()}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalList}
                      />
                    </View>
                  ))}
                </View>
              )}

              {tab === 'music' && <Text style={styles.placeholder}>Danh sách Nhạc</Text>}
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
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  seeAll: { paddingHorizontal: 8, paddingVertical: 4 },
  seeAllText: { color: '#94A3B8', fontSize: 13 },
});