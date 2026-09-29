import { useAuth } from '@/src/contexts/auth';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

export default function RegisterScreen() {
  const { user, loading, register } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'artist'>('user');
  
  // Artist specific fields
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (loading) return <ActivityIndicator accessibilityLabel="Đang kiểm tra đăng nhập" />;
  

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

  async function submit() {
    if (busy) return;
    if (!username.trim() || !email.trim() || !password) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (role === 'artist' && !address.trim()) {
      setError('Vui lòng cung cấp địa chỉ cho tài khoản nghệ sĩ.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const data: any = { username, email, password, role };
      if (role === 'artist') {
        data.address = address;
        data.bio = bio;
        data.avatar_url = avatar;
      }
      await register(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể đăng ký.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.page}>
      <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.center} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.brand}>MOBILE2</Text>
            <Text style={styles.title}>Đăng ký</Text>
            
            <View style={styles.roleContainer}>
              <Pressable style={[styles.roleButton, role === 'user' && styles.roleActive]} onPress={() => setRole('user')}>
                <Text style={[styles.roleText, role === 'user' && styles.roleTextActive]}>Người dùng</Text>
              </Pressable>
              <Pressable style={[styles.roleButton, role === 'artist' && styles.roleActive]} onPress={() => setRole('artist')}>
                <Text style={[styles.roleText, role === 'artist' && styles.roleTextActive]}>Nghệ sĩ</Text>
              </Pressable>
            </View>

            <Text style={styles.label}>Tên đăng nhập</Text>
            <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" editable={!busy} placeholder="Tên của bạn" placeholderTextColor="#64748B" />

            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!busy} placeholder="Email của bạn" placeholderTextColor="#64748B" />
            
            <Text style={styles.label}>Mật khẩu</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" editable={!busy} placeholder="Mật khẩu" placeholderTextColor="#64748B" />

            {role === 'artist' && (
              <View>
                <Text style={styles.label}>Ảnh đại diện</Text>
                <Pressable style={styles.imagePicker} onPress={pickImage}>
                  {avatar ? (
                    <Image source={{ uri: avatar }} style={styles.avatarPreview} />
                  ) : (
                    <Text style={styles.imagePickerText}>Chọn ảnh</Text>
                  )}
                </Pressable>

                <Text style={styles.label}>Địa chỉ</Text>
                <TextInput style={styles.input} value={address} onChangeText={setAddress} editable={!busy} placeholder="Địa chỉ của bạn" placeholderTextColor="#64748B" />

                <Text style={styles.label}>Tiểu sử</Text>
                <TextInput style={[styles.input, { height: 80 }]} value={bio} onChangeText={setBio} multiline editable={!busy} placeholder="Giới thiệu về bạn" placeholderTextColor="#64748B" />
              </View>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}
            
            <Pressable disabled={busy} onPress={submit} style={[styles.button, busy && { opacity: 0.5 }]}>
              <Text style={styles.buttonText}>{busy ? 'Đang đăng ký...' : 'Đăng ký'}</Text>
            </Pressable>
            
            <Pressable onPress={() => router.replace('/login')}><Text style={styles.back}>Đã có tài khoản? Đăng nhập</Text></Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#020817' },
  center: { flexGrow: 1, alignItems: 'center', justifyItems: 'center', padding: 24, paddingTop: 40, paddingBottom: 40 },
  card: { width: '100%', maxWidth: 440, padding: 28, backgroundColor: '#111827', borderRadius: 20 },
  brand: { color: '#A78BFA', fontWeight: '800', letterSpacing: 3, marginBottom: 24, textAlign: 'center' },
  title: { color: '#FFF', fontSize: 28, fontWeight: '700', marginBottom: 24, textAlign: 'center' },
  roleContainer: { flexDirection: 'row', marginBottom: 20, gap: 10 },
  roleButton: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  roleActive: { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' },
  roleText: { color: '#94A3B8', fontWeight: '600' },
  roleTextActive: { color: '#FFF' },
  label: { color: '#E2E8F0', marginBottom: 8 },
  input: { color: '#FFF', backgroundColor: '#020817', padding: 14, borderRadius: 10, marginBottom: 18, borderWidth: 1, borderColor: '#334155' },
  error: { color: '#FDA4AF', marginBottom: 16, textAlign: 'center' },
  button: { backgroundColor: '#8B5CF6', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#FFF', fontWeight: '700' },
  back: { color: '#A5B4FC', textAlign: 'center', marginTop: 22 },
  imagePicker: { backgroundColor: '#020817', borderWidth: 1, borderColor: '#334155', borderRadius: 10, height: 100, marginBottom: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  imagePickerText: { color: '#64748B' },
  avatarPreview: { width: '100%', height: '100%' }
});
