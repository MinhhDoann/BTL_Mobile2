import { FooterAction } from '@/src/components/ui/footer';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/auth';
import { Alert, Linking, Platform } from 'react-native';

export function useFooterActions(activeTab: string = 'home'): FooterAction[] {
  const router = useRouter();
  const { user } = useAuth();

  return [
    {
      title: 'Trang chủ',
      icon: 'house.fill',
      active: activeTab === 'home',
      onPress: () => {
        router.push('/' as any);
      },
    },
    {
      title: 'Tìm kiếm',
      icon: 'magnifyingglass',
      active: activeTab === 'search',
      onPress: () => {
        console.log('Chuyển tới Tìm kiếm');
        router.push('/search' as any);
      },
    },
    {
      title: 'Thư viện',
      icon: 'books.vertical',
      active: activeTab === 'library',
      onPress: () => {
        console.log('Chuyển tới Thư viện');
        router.push('/library' as any);
      },
    },
    {
      title: 'Đăng ký',
      icon: 'music.note',
      active: activeTab === 'register',
      onPress: () => {
        console.log('Chuyển tới Đăng ký');
        // router.push('/register');
      },
    },
    ...(user?.role === 'admin' ? [{
      title: 'Quản lý',
      icon: 'shield.fill',
      active: activeTab === 'admin',
      onPress: () => {
        if (Platform.OS === 'web') {
          router.push('/admin');
          return;
        }
        const url = process.env.EXPO_PUBLIC_ADMIN_WEB_URL;
        if (!url || !/^https?:\/\//i.test(url)) {
          Alert.alert('Quản trị trên web', 'Địa chỉ trang quản trị chưa được cấu hình. Vui lòng liên hệ người vận hành.');
          return;
        }
        void Linking.openURL(url).catch(() => Alert.alert('Không thể mở trang quản trị', 'Vui lòng thử lại.'));
      },
    }] : []),
  ];
}
