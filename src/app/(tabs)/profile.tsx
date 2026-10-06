import { useAuth } from '@/src/contexts/auth';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Footer } from '@/src/components/ui/footer';
import { useFooterActions } from '@/src/constants/footer-actions';
import { changePassword, forgotPassword } from '@/src/lib/api/auth-api';

export default function ProfileScreen() {
  const { user, loading, logout, upgrade } = useAuth();
  const router = useRouter();
  const footerActions = useFooterActions('profile');

  const [isUpgrading, setIsUpgrading] = useState(false);
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Change password states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotBusy, setForgotBusy] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotErr, setForgotErr] = useState('');

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );

  if (!user) {
    return (
      <SafeAreaView style={styles.page} edges={['top', 'left', 'right']}>
        <View style={styles.center}>
          <Text style={styles.message}>Bạn chưa đăng nhập</Text>
          <Pressable style={styles.button} onPress={() => router.push('/login')}>
            <Text style={styles.buttonText}>Đăng nhập</Text>
          </Pressable>
        </View>
        <Footer actions={footerActions} />
      </SafeAreaView>
    );
  }

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  }

  async function handleUpgrade() {
    if (busy) return;
    if (!address.trim()) {
      setError('Vui lòng cung cấp địa chỉ.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await upgrade({ address, bio, avatar_url: avatar });
      setIsUpgrading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể nâng cấp.');
    } finally {
      setBusy(false);
    }
  }

  async function handleChangePasswordSubmit() {
    if (pwBusy) return;
    setPwError('');
    setPwSuccess('');

    if (!oldPassword) {
      setPwError('Vui lòng nhập mật khẩu cũ.');
      return;
    }
    if (!newPassword) {
      setPwError('Vui lòng nhập mật khẩu mới.');
      return;
    }
    if (newPassword.length < 4) {
      setPwError('Mật khẩu mới phải từ 4 ký tự trở lên.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    setPwBusy(true);
    try {
      const res = await changePassword(oldPassword, newPassword);
      setPwSuccess(res.message || 'Đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setIsChangingPassword(false);
        setPwSuccess('');
      }, 2500);
    } catch (err: any) {
      setPwError(err?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.');
    } finally {
      setPwBusy(false);
    }
  }

  async function handleForgotSubmit() {
    if (forgotBusy) return;
    setForgotErr('');
    setForgotMsg('');

    const targetEmail = forgotEmail.trim() || user?.email || '';
    if (!targetEmail) {
      setForgotErr('Vui lòng nhập email.');
      return;
    }

    setForgotBusy(true);
    try {
      const res = await forgotPassword(targetEmail);
      setForgotMsg(res.message);
    } catch (err: any) {
      setForgotErr(err?.message || 'Không thể gửi mật khẩu về email. Vui lòng kiểm tra lại email.');
    } finally {
      setForgotBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.page} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarPlaceholder}>
            {user.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{user.username?.charAt(0).toUpperCase()}</Text>
            )}
          </View>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {user.role === 'artist'
                ? 'Nghệ sĩ'
                : user.role === 'admin'
                ? 'Quản trị viên'
                : 'Người dùng'}
            </Text>
          </View>
        </View>

        {user.role === 'user' && !isUpgrading && user.artist_request_status === 'pending' && (
          <View style={[styles.upgradeBtn, { backgroundColor: '#475569' }]}>
            <Text style={styles.upgradeBtnText}>Yêu cầu nâng cấp đang chờ admin duyệt...</Text>
          </View>
        )}

        {user.role === 'user' && !isUpgrading && user.artist_request_status !== 'pending' && (
          <Pressable style={styles.upgradeBtn} onPress={() => setIsUpgrading(true)}>
            <Text style={styles.upgradeBtnText}>Nâng cấp lên Nghệ sĩ</Text>
          </Pressable>
        )}

        {isUpgrading && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Đăng ký làm Nghệ sĩ</Text>

            <Text style={styles.label}>Ảnh đại diện</Text>
            <Pressable style={styles.imagePicker} onPress={pickImage}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarPreview} />
              ) : (
                <Text style={styles.imagePickerText}>Chọn ảnh</Text>
              )}
            </Pressable>

            <Text style={styles.label}>Địa chỉ</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              editable={!busy}
              placeholder="Địa chỉ liên hệ"
              placeholderTextColor="#64748B"
            />

            <Text style={styles.label}>Tiểu sử</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={bio}
              onChangeText={setBio}
              multiline
              editable={!busy}
              placeholder="Giới thiệu về bạn"
              placeholderTextColor="#64748B"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.actionRow}>
              <Pressable style={styles.cancelBtn} onPress={() => setIsUpgrading(false)} disabled={busy}>
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </Pressable>
              <Pressable style={styles.submitBtn} onPress={handleUpgrade} disabled={busy}>
                <Text style={styles.submitBtnText}>{busy ? 'Đang xử lý...' : 'Xác nhận'}</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Form đổi mật khẩu */}
        {!isChangingPassword ? (
          <Pressable
            style={styles.changePwToggleBtn}
            onPress={() => {
              setIsChangingPassword(true);
              setPwError('');
              setPwSuccess('');
            }}
          >
            <Text style={styles.changePwToggleText}>🔒 Đổi mật khẩu</Text>
          </Pressable>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Đổi mật khẩu</Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.label}>Mật khẩu cũ *</Text>
              <Pressable
                onPress={() => {
                  setForgotEmail(user.email || '');
                  setForgotErr('');
                  setForgotMsg('');
                  setShowForgotModal(true);
                }}
              >
                <Text style={{ color: '#38BDF8', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
                  Quên mật khẩu cũ?
                </Text>
              </Pressable>
            </View>
            <TextInput
              style={styles.input}
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
              editable={!pwBusy}
              placeholder="Nhập mật khẩu hiện tại"
              placeholderTextColor="#64748B"
            />

            <Text style={styles.label}>Mật khẩu mới *</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              editable={!pwBusy}
              placeholder="Nhập mật khẩu mới"
              placeholderTextColor="#64748B"
            />

            <Text style={styles.label}>Xác nhận mật khẩu mới *</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!pwBusy}
              placeholder="Nhập lại mật khẩu mới"
              placeholderTextColor="#64748B"
            />

            {pwError ? <Text style={styles.error}>{pwError}</Text> : null}
            {pwSuccess ? <Text style={{ color: '#34D399', marginBottom: 16, fontWeight: '600' }}>{pwSuccess}</Text> : null}

            <View style={styles.actionRow}>
              <Pressable style={styles.cancelBtn} onPress={() => setIsChangingPassword(false)} disabled={pwBusy}>
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </Pressable>
              <Pressable style={styles.submitBtn} onPress={handleChangePasswordSubmit} disabled={pwBusy}>
                {pwBusy ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Đổi mật khẩu</Text>
                )}
              </Pressable>
            </View>
          </View>
        )}

        <Pressable style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutBtnText}>Đăng xuất</Text>
        </Pressable>
      </ScrollView>

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForgotModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Lấy lại mật khẩu qua Email</Text>
            <Text style={{ color: '#94A3B8', fontSize: 13, marginBottom: 16 }}>
              Nhập email tài khoản của bạn. Mật khẩu hiện tại/cũ sẽ được gửi trực tiếp về email này.
            </Text>

            <Text style={styles.label}>Email của bạn</Text>
            <TextInput
              style={styles.input}
              value={forgotEmail}
              onChangeText={setForgotEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="example@gmail.com"
              placeholderTextColor="#64748B"
              editable={!forgotBusy}
            />

            {forgotErr ? <Text style={styles.error}>{forgotErr}</Text> : null}
            {forgotMsg ? <Text style={{ color: '#38BDF8', marginBottom: 16, fontWeight: '600' }}>{forgotMsg}</Text> : null}

            <View style={styles.actionRow}>
              <Pressable style={styles.cancelBtn} onPress={() => setShowForgotModal(false)} disabled={forgotBusy}>
                <Text style={styles.cancelBtnText}>Đóng</Text>
              </Pressable>
              <Pressable style={styles.submitBtn} onPress={handleForgotSubmit} disabled={forgotBusy}>
                {forgotBusy ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Gửi về Email</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Footer actions={footerActions} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#020817' },
  center: { flex: 1, backgroundColor: '#020817', alignItems: 'center', justifyContent: 'center' },
  message: { color: '#FFF', fontSize: 18, marginBottom: 20 },
  button: { backgroundColor: '#8B5CF6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: '#FFF', fontWeight: 'bold' },
  container: { padding: 24, alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 24 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { color: '#FFF', fontSize: 36, fontWeight: 'bold' },
  username: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  email: { color: '#94A3B8', fontSize: 16, marginBottom: 12 },
  roleBadge: {
    backgroundColor: '#1E1B4B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  roleText: { color: '#C4B5FD', fontSize: 14, fontWeight: '600' },
  upgradeBtn: {
    backgroundColor: '#10B981',
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  upgradeBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  changePwToggleBtn: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  changePwToggleText: { color: '#38BDF8', fontWeight: 'bold', fontSize: 16 },
  card: { width: '100%', backgroundColor: '#111827', padding: 20, borderRadius: 16, marginBottom: 16 },
  cardTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  label: { color: '#E2E8F0', marginBottom: 8 },
  input: {
    color: '#FFF',
    backgroundColor: '#020817',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  error: { color: '#FDA4AF', marginBottom: 16 },
  actionRow: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: '#334155', alignItems: 'center' },
  cancelBtnText: { color: '#FFF', fontWeight: '600' },
  submitBtn: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: '#8B5CF6', alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: '600' },
  logoutBtn: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  logoutBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  imagePicker: {
    backgroundColor: '#020817',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    height: 100,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imagePickerText: { color: '#64748B' },
  avatarPreview: { width: '100%', height: '100%' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
