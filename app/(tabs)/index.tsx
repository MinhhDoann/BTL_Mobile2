import { AppHeader } from '@/components/ui/app-header';
import { Footer } from '@/components/ui/footer';
import { useFooterActions } from '@/constants/footer-actions';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const footerActions = useFooterActions('home');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <AppHeader title="Trang chủ" onBackPress={() => console.log('Back')} />

        <View style={styles.content}>
          <Text style={styles.text}>Nội dung chính</Text>
        </View>
        <Footer actions={footerActions} />
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