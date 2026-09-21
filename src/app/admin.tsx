import { useAuth } from '@/src/contexts/auth';
import AdminDashboard from '@/src/screens/admin-dashboard';
import { Redirect } from 'expo-router';
import { ActivityIndicator, Platform, View } from 'react-native';

export default function AdminScreen() {
  const { user, loading } = useAuth();
  if (Platform.OS !== 'web') return <Redirect href="/" />;
  if (loading) return <View style={{ flex: 1, backgroundColor: '#020817', justifyContent: 'center' }}><ActivityIndicator color="#A78BFA" /></View>;
  if (!user) return <Redirect href="/login?next=admin" />;
  if (user.role !== 'admin') return <Redirect href="/" />;
  return <AdminDashboard />;
}
