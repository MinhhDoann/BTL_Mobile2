import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/ui/app-header';
import { Footer } from '@/components/ui/footer';

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
            {
              title: 'Bỏ qua',
              variant: 'ghost',
              onPress: () => console.log('Bỏ qua'),
            },
            {
              title: 'Hủy',
              variant: 'secondary',
              onPress: () => console.log('Hủy'),
            },
            {
              title: 'Tiếp tục',
              variant: 'primary',
              onPress: () => console.log('Tiếp tục'),
            },
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