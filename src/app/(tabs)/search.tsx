import { AppHeader } from '@/src/components/ui/app-header';
import { Footer } from '@/src/components/ui/footer';
import { useFooterActions } from '@/src/constants/footer-actions';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
  const footerActions = useFooterActions('search');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <AppHeader title="Tìm kiếm" onBackPress={() => console.log('Back')} />
        <View style={styles.content}>
          <TextInput
            style={styles.searchInput}
            placeholder="Bạn muốn nghe gì hôm nay?"
            placeholderTextColor="#64748B"
          />
          <Text style={styles.text}>Màn hình tìm kiếm</Text>
          <Text style={styles.text}>Khám phá xu hường </Text>
        </View>
        <Footer actions={footerActions} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B1120' },
  container: { flex: 1 },
  content: { 
    flex: 1, 
    padding: 16, 
    alignItems: 'center' 
  },
  searchInput: {
    width: '100%',
    height: 48,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    marginBottom: 20,
    fontSize: 15,
  },
  text: { color: '#94A3B8', fontSize: 16, marginTop: 20 },
});