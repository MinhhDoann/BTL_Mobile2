import { useAuth } from '@/src/contexts/auth';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { forgotPassword } from '@/src/lib/api/auth-api';

export default function LoginScreen() {
  const { user, loading, login } = useAuth();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotBusy, setForgotBusy] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotErr, setForgotErr] = useState('');

  if (loading) return <ActivityIndicator accessibilityLabel="Đang kiểm tra đăng nhập" />;
  if (user)
    return (
      <Redirect
        href={next === 'admin' && Platform.OS === 'web' && user.role === 'admin' ? '/admin' : '/profile'}
      />
    );

  async function submit() {
    if (busy) return;
    if (!email.trim() || !password) {
      setError('Vui lòng nhập email và mật khẩu.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể đăng nhập.');
    } finally {
      setBusy(false);
    }
  }

  async function handleForgotSubmit() {
    if (forgotBusy) return;
    setForgotErr('');
    setForgotMsg('');

    const targetEmail = forgotEmail.trim() || email.trim();
    if (!targetEmail) {
      setForgotErr('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }

    setForgotBusy(true);
    try {
      const res = await forgotPassword(targetEmail);
      setForgotMsg(res.message);
    } catch (err: any) {
      setForgotErr(err?.message || 'Không thể gửi yêu cầu khôi phục mật khẩu. Vui lòng kiểm tra lại email.');
    } finally {
      setForgotBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.page}>
      <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.center} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.brand}>MOBILE2</Text>
            <Text style={styles.title}>Đăng nhập</Text>
            <Text style={styles.description}>Đăng nhập bằng tài khoản của bạn để tiếp tục.</Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              accessibilityLabel="Email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!busy}
              placeholder="Email của bạn"
              placeholderTextColor="#64748B"
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.label}>Mật khẩu</Text>
              <Pressable
                onPress={() => {
                  setForgotEmail(email.trim());
                  setForgotErr('');
                  setForgotMsg('');
                  setShowForgotModal(true);
                }}
              >
                <Text style={styles.forgotLink}>Quên mật khẩu?</Text>
              </Pressable>
            </View>
            <TextInput
              accessibilityLabel="Mật khẩu"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="current-password"
              editable={!busy}
              onSubmitEditing={submit}
              placeholder="Mật khẩu"
              placeholderTextColor="#64748B"
            />

            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={submit}
              style={[styles.button, busy && { opacity: 0.5 }]}
            >
              <Text style={styles.buttonText}>{busy ? 'Đang đăng nhập...' : 'Đăng nhập'}</Text>
            </Pressable>

            <View style={styles.links}>
              <Pressable accessibilityRole="link" onPress={() => router.push('/register')}>
                <Text style={styles.link}>Đăng ký tài khoản</Text>
              </Pressable>
              <Pressable accessibilityRole="link" onPress={() => router.replace('/')}>
                <Text style={styles.link}>Về trang chủ</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForgotModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Quên mật khẩu</Text>
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

            <View style={styles.modalActionRow}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#020817' },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 440, padding: 28, backgroundColor: '#111827', borderRadius: 20 },
  brand: { color: '#A78BFA', fontWeight: '800', letterSpacing: 3, marginBottom: 24 },
  title: { color: '#FFF', fontSize: 28, fontWeight: '700' },
  description: { color: '#94A3B8', marginTop: 10, marginBottom: 24, lineHeight: 22 },
  label: { color: '#E2E8F0', marginBottom: 8 },
  forgotLink: { color: '#A5B4FC', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: {
    color: '#FFF',
    backgroundColor: '#020817',
    padding: 14,
    borderRadius: 10,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  error: { color: '#FDA4AF', marginBottom: 16 },
  button: { backgroundColor: '#8B5CF6', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: '700' },
  links: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 22 },
  link: { color: '#A5B4FC', textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 440,
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
  modalActionRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: '#334155', alignItems: 'center' },
  cancelBtnText: { color: '#FFF', fontWeight: '600' },
  submitBtn: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: '#8B5CF6', alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: '600' },
});
