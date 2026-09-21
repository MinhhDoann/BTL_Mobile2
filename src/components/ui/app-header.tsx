import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/contexts/auth';
import { useRouter } from 'expo-router';
import { ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type AppHeaderProps = {
  title: string;
  onBackPress?: () => void;
  rightAction?: ReactNode;
};

export function AppHeader({ title, onBackPress, rightAction }: AppHeaderProps) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {onBackPress ? (
          <Pressable
            accessibilityLabel="Quay lại"
            accessibilityRole="button"
            hitSlop={10}
            onPress={onBackPress}
            style={styles.iconButton}>
            <Ionicons name="chevron-back" size={24} color="#F8FAFC" />
          </Pressable>
        ) : null}
      </View>

      <Text numberOfLines={1} style={styles.title}>
        {title}      
      </Text>

      <View style={[styles.side, styles.rightSide]}>{rightAction}
        <Pressable accessibilityRole="button" disabled={loading || busy} style={styles.button} onPress={async () => {
          if (!user) { router.push('/login'); return; }
          setBusy(true);
          setError('');
          try { await logout(); }
          catch { setError('Đăng xuất thất bại. Thử lại.'); }
          finally { setBusy(false); }
        }}>
          <Text style={{ color: '#FFFFFF' }}>{busy ? 'Đang đăng xuất...' : user ? 'Đăng xuất' : 'Đăng nhập'}</Text>
        </Pressable>
        {error ? <Text accessibilityRole="alert" style={{ color: '#FDA4AF', fontSize: 11 }}>{error}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 56,
    paddingHorizontal: 12,
    backgroundColor: '#0B1120',
  },
  side: {
    alignItems: 'flex-start',
    minWidth: 44,
    marginRight: 8,
  },
  rightSide: {
    alignItems: 'flex-end',
  },
  iconButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  title: {
    color: '#F8FAFC',
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
