import { AppHeader } from '@/components/ui/app-header';
import { Footer } from '@/components/ui/footer';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <AppHeader title="Trang chủ" onBackPress={() => console.log('Back')} />

        <View style={styles.content}>
          <Text style={styles.text}>Nội dung chính</Text>
        </View>
        <Footer
          actions={[
            { title: 'Trang chủ', icon: 'house.fill', active: true, onPress: () => console.log('Trang chủ') },
            { title: 'Tìm kiếm', icon: 'magnifyingglass', onPress: () => console.log('Tìm kiếm') },
            { title: 'Thư viện', icon: 'books.vertical', onPress: () => console.log('Thư viện') },
            { title: 'Đăng ký', icon: 'music.note', onPress: () => console.log('Login') },
            { title: 'Tạo', icon: 'plus', onPress: () => console.log('Tạo') },
          ]}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B1120' },
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { color: '#FFF', fontSize: 16 },
});