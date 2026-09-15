import { FooterAction } from '@/src/components/ui/footer';
import { useRouter } from 'expo-router';

export function useFooterActions(activeTab: string = 'home'): FooterAction[] {
  const router = useRouter();

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
        router.push('/search' as any);
      },
    },
    {
      title: 'Thư viện',
      icon: 'books.vertical',
      active: activeTab === 'library',
      onPress: () => {
        router.push('/library' as any);
      },
    },
    {
      title: 'Đăng ký',
      icon: 'music.note',
      active: activeTab === 'register',
      onPress: () => {
        console.log('Chuyển tới Đăng ký');
      },
    },
    {
      title: 'Tạo',
      icon: 'plus',
      active: activeTab === 'create',
      onPress: () => {
        console.log('Chuyển tới Tạo');
      },
    },
  ];
}