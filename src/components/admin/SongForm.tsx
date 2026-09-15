import { ArtistOption, CreateSongInput, GenreOption } from '@/src/types/admin';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface SongFormProps {
  artists: ArtistOption[];
  genres: GenreOption[];
  value: CreateSongInput;
  submitting: boolean;
  onChange: (field: keyof CreateSongInput, value: string | number[]) => void;
  onToggleGenre: (genreId: number) => void;
  onSubmit: () => void;
}

export function SongForm({
  artists,
  genres,
  value,
  submitting,
  onChange,
  onToggleGenre,
  onSubmit,
}: SongFormProps) {
  const pickCoverFromDevice = async (mode: 'gallery' | 'camera') => {
    try {
      const result = mode === 'camera'
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.9,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
          })
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 0.9,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
          });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const pickedUri = result.assets[0].uri;
      onChange('cover_url', pickedUri);
      Alert.alert('Thành công', 'Đã chọn ảnh từ thiết bị.');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh từ thiết bị.');
    }
  };

  const pickAudioFromDevice = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/mpeg', 'audio/mp3', 'audio/*', 'application/octet-stream'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const pickedUri = result.assets[0].uri;
      onChange('audio_url', pickedUri);
      Alert.alert('Thành công', 'Đã chọn file nhạc từ thiết bị.');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn file nhạc từ thiết bị.');
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Đăng bài mới</Text>

      <Text style={styles.label}>Tên bài hát</Text>
      <TextInput
        value={value.title}
        onChangeText={(text) => onChange('title', text)}
        placeholder="Ví dụ: Em của ngày hôm qua"
        placeholderTextColor="#64748B"
        style={styles.input}
      />

      <Text style={styles.label}>Nghệ sĩ</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>
        {artists.map((artist) => {
          const selected = Number(value.artist_id) === artist.artist_id;

          return (
            <TouchableOpacity
              key={artist.artist_id}
              onPress={() => onChange('artist_id', String(artist.artist_id))}
              style={[styles.choiceChip, selected && styles.choiceChipActive]}
            >
              <Text style={[styles.choiceChipText, selected && styles.choiceChipTextActive]}>{artist.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.label}>Album ID (tuỳ chọn)</Text>
      <TextInput
        value={value.album_id}
        onChangeText={(text) => onChange('album_id', text)}
        placeholder="Ví dụ: 1"
        keyboardType="numeric"
        placeholderTextColor="#64748B"
        style={styles.input}
      />

      <Text style={styles.label}>Thời lượng (giây)</Text>
      <TextInput
        value={value.duration}
        onChangeText={(text) => onChange('duration', text)}
        placeholder="Ví dụ: 240"
        keyboardType="numeric"
        placeholderTextColor="#64748B"
        style={styles.input}
      />

      <Text style={styles.label}>Audio URL hoặc file nhạc</Text>
      <TextInput
        value={value.audio_url}
        onChangeText={(text) => onChange('audio_url', text)}
        placeholder="Dán link https://.../song.mp3 hoặc chọn file local"
        placeholderTextColor="#64748B"
        style={styles.input}
      />
      <TouchableOpacity style={styles.inlineButton} onPress={pickAudioFromDevice}>
        <Text style={styles.inlineButtonText}>Chọn file MP3</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Cover URL hoặc ảnh local</Text>
      <TextInput
        value={value.cover_url}
        onChangeText={(text) => onChange('cover_url', text)}
        placeholder="Dán link https://.../cover.jpg hoặc chọn ảnh local"
        placeholderTextColor="#64748B"
        style={styles.input}
      />
      <View style={styles.inlineActions}>
        <TouchableOpacity style={styles.inlineButton} onPress={() => pickCoverFromDevice('gallery')}>
          <Text style={styles.inlineButtonText}>Chọn ảnh</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.inlineButton} onPress={() => pickCoverFromDevice('camera')}>
          <Text style={styles.inlineButtonText}>Chụp ảnh</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Lời bài hát</Text>
      <TextInput
        value={value.lyrics}
        onChangeText={(text) => onChange('lyrics', text)}
        placeholder="Nhập lời bài hát hoặc mô tả ngắn..."
        placeholderTextColor="#64748B"
        multiline
        numberOfLines={5}
        style={[styles.input, styles.textarea]}
      />

      <Text style={styles.label}>Thể loại</Text>
      <View style={styles.genreGrid}>
        {genres.map((genre) => {
          const selected = value.genres.includes(genre.genre_id);

          return (
            <TouchableOpacity
              key={genre.genre_id}
              onPress={() => onToggleGenre(genre.genre_id)}
              style={[styles.genreChip, selected && styles.genreChipActive]}
            >
              <Text style={[styles.genreChipText, selected && styles.genreChipTextActive]}>{genre.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={onSubmit} disabled={submitting}>
        <Text style={styles.primaryButtonText}>{submitting ? 'Đang đăng...' : 'Đăng bài'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
  label: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  inlineActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  inlineButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 6,
  },
  inlineButtonText: {
    color: '#E2E8F0',
    fontWeight: '600',
    fontSize: 12,
  },
  choiceRow: {
    paddingVertical: 6,
    gap: 8,
  },
  choiceChip: {
    borderRadius: 999,
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
  },
  choiceChipActive: {
    backgroundColor: '#A78BFA',
  },
  choiceChipText: {
    color: '#E2E8F0',
    fontWeight: '600',
  },
  choiceChipTextActive: {
    color: '#0F172A',
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  genreChip: {
    backgroundColor: '#1E293B',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  genreChipActive: {
    backgroundColor: '#22C55E',
  },
  genreChipText: {
    color: '#E2E8F0',
    fontWeight: '600',
  },
  genreChipTextActive: {
    color: '#052E16',
  },
  primaryButton: {
    marginTop: 18,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
