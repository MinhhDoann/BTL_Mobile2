import { useAuth } from '@/src/contexts/auth';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { user, loading, login } = useAuth();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (loading) return <ActivityIndicator accessibilityLabel="Đang kiểm tra đăng nhập" />;
  if (user) return <Redirect href={next === 'admin' && Platform.OS === 'web' && user.role === 'admin' ? '/admin' : '/'} />;
  async function submit() {
    if (busy) return;
    if (!email.trim() || !password) { setError('Vui lòng nhập email và mật khẩu.'); return; }
    setBusy(true);
    setError('');
    try { await login(email.trim(), password); }
    catch (err) { setError(err instanceof Error ? err.message : 'Không thể đăng nhập.'); }
    finally { setBusy(false); }
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
            <TextInput accessibilityLabel="Email" style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" editable={!busy} placeholder="Email của bạn" placeholderTextColor="#64748B" />
            <Text style={styles.label}>Mật khẩu</Text>
            <TextInput accessibilityLabel="Mật khẩu" style={styles.input} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoComplete="current-password" editable={!busy} onSubmitEditing={submit} placeholder="Mật khẩu" placeholderTextColor="#64748B" />
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            <Pressable accessibilityRole="button" disabled={busy} onPress={submit} style={[styles.button, busy && { opacity: 0.5 }]}>
              <Text style={styles.buttonText}>{busy ? 'Đang đăng nhập...' : 'Đăng nhập'}</Text>
            </Pressable>
            <Pressable accessibilityRole="link" onPress={() => router.replace('/')}><Text style={styles.back}>Về trang chủ</Text></Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  input: { color: '#FFF', backgroundColor: '#020817', padding: 14, borderRadius: 10, marginBottom: 18, borderWidth: 1, borderColor: '#334155' },
  error: { color: '#FDA4AF', marginBottom: 16 },
  button: { backgroundColor: '#8B5CF6', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: '700' },
  back: { color: '#A5B4FC', textAlign: 'center', marginTop: 22 },
});
