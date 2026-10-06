import { ArtistOption, CreateSongInput, GenreOption } from '@/src/types/admin';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleSubmitWithCheck = () => {
    if (!acceptedTerms) {
      Alert.alert(
        'Chưa đồng ý Điều khoản',
        'Vui lòng đọc và tích chọn đồng ý với Điều khoản sử dụng & Chính sách bản quyền trước khi đăng bài.'
      );
      return;
    }
    onSubmit();
  };

  const pickCoverFromDevice = async (mode: 'gallery' | 'camera') => {
    try {
      if (mode === 'camera') {
        Alert.alert('Tính năng chụp ảnh', 'Vui lòng điền link ảnh thủ công hoặc chọn từ thư viện (Web không hỗ trợ chụp ảnh trực tiếp qua DocumentPicker).');
        return;
      }
      
      const { pickAndUploadImage } = require('@/src/lib/upload');
      const url = await pickAndUploadImage();
      
      if (url) {
        onChange('cover_url', url);
        Alert.alert('Thành công', 'Đã tải ảnh lên Cloudinary.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể chọn hoặc tải ảnh lên thiết bị.');
    }
  };

  const pickAudioFromDevice = async () => {
    try {
      // KHÔNG DÙNG Alert.alert ở đây trên Web vì nó sẽ block hành động chọn file của trình duyệt.
      const { pickAndUploadAudio } = require('@/src/lib/upload');
      const url = await pickAndUploadAudio();
      
      if (url) {
        onChange('audio_url', url);
        Alert.alert('Thành công', 'Đã upload nhạc lên Cloudinary thành công!');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể upload. Hãy kiểm tra lại cấu hình Cloudinary.');
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Đăng bài mới</Text>

      <View style={styles.noticeBox}>
        <Text style={styles.noticeText}>
          ⚠️ Đây là phần mềm trung gian, người đăng tự chịu trách nhiệm bản quyền
        </Text>
      </View>

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

      {/* Điều khoản sử dụng & Bản quyền */}
      <View style={styles.termsCard}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setAcceptedTerms(!acceptedTerms)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={acceptedTerms ? 'checkbox' : 'square-outline'}
            size={22}
            color={acceptedTerms ? '#10B981' : '#94A3B8'}
          />
          <Text style={styles.checkboxLabel}>
            Tôi đã đọc và đồng ý với{' '}
            <Text
              style={styles.termsLink}
              onPress={() => setShowTermsModal(true)}
            >
              Điều khoản sử dụng & Chính sách bản quyền
            </Text>
            {' '}(Xác nhận tự chịu 100% trách nhiệm bản quyền).
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.readTermsBtn}
          onPress={() => setShowTermsModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.readTermsBtnText}>📜 Xem chi tiết Điều khoản sử dụng</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleSubmitWithCheck} disabled={submitting}>
        <Text style={styles.primaryButtonText}>{submitting ? 'Đang đăng...' : 'Đăng bài'}</Text>
      </TouchableOpacity>

      {/* MODAL ĐIỀU KHOẢN SỬ DỤNG VÀ CHÍNH SÁCH BẢN QUYỀN */}
      <Modal visible={showTermsModal} animationType="slide" transparent={true} onRequestClose={() => setShowTermsModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ĐIỀU KHOẢN & BẢN QUYỀN</Text>
              <TouchableOpacity onPress={() => setShowTermsModal(false)}>
                <Ionicons name="close" size={24} color="#F8FAFC" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400, marginVertical: 10 }}>
              <Text style={styles.tosHeader}>1. Vai trò của nền tảng Mobile 2</Text>
              <Text style={styles.tosBody}>
                Nền tảng trung gian cung cấp dịch vụ lưu trữ (Hosting Provider). Chúng tôi cung cấp không gian cho người dùng tự do đăng tải tác phẩm. Mobile 2 không sở hữu, không sản xuất và không chịu trách nhiệm phân phối các bản ghi âm trái phép.
              </Text>

              <Text style={styles.tosHeader}>2. Trách nhiệm người đăng tải (Uploader)</Text>
              <Text style={styles.tosBody}>
                • Quyền sở hữu hợp pháp: Tác phẩm do bạn sáng tác, sở hữu bản quyền hoặc được cấp phép hợp pháp.{'\n'}
                • Chịu trách nhiệm 100%: Người đăng tải tự chịu trách nhiệm pháp lý. Mobile 2 được miễn trừ mọi trách nhiệm liên đới.
              </Text>

              <Text style={styles.tosHeader}>3. Tuyên bố Miễn trừ Trách nhiệm</Text>
              <Text style={styles.tosBody}>
                Mobile 2 không có nghĩa vụ kiểm duyệt trước toàn bộ nội dung do người dùng tạo ra (UGC). Việc bài hát hiển thị không đồng nghĩa xác nhận tính hợp pháp bản quyền.
              </Text>

              <Text style={styles.tosHeader}>4. Chính sách Xử lý Vi phạm (Notice-and-Takedown)</Text>
              <Text style={styles.tosBody}>
                • Tiếp nhận khiếu nại kèm bằng chứng.{'\n'}
                • Admin có toàn quyền ẩn hoặc xóa bài hát vi phạm ngay lập tức.{'\n'}
                • Tài khoản vi phạm nhiều lần sẽ bị khóa vĩnh viễn.
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: '#10B981', marginTop: 10 }]}
              onPress={() => {
                setAcceptedTerms(true);
                setShowTermsModal(false);
              }}
            >
              <Text style={styles.primaryButtonText}>Tôi đã hiểu & Đồng ý</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  noticeBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  noticeText: {
    color: '#FBBF24',
    fontSize: 13,
    fontWeight: '600',
  },
  termsCard: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    marginBottom: 6,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkboxLabel: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  termsLink: {
    color: '#38BDF8',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  readTermsBtn: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  readTermsBtnText: {
    color: '#A78BFA',
    fontSize: 12,
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
    maxWidth: 540,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  tosHeader: {
    color: '#38BDF8',
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 10,
    marginBottom: 4,
  },
  tosBody: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
  },
});
