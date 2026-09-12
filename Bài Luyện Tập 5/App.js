import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar } from 'react-native';

/**
 * BÀI TẬP 2 - BÀI LUYỆN TẬP 5: GIAO DIỆN REACT NATIVE ĐƠN GIẢN
 * Hiển thị dòng chữ "Hello React Native" căn giữa màn hình
 */
const App = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.badge}>React Native Mobile</Text>
          <Text style={styles.title}>Hello React Native</Text>
          <Text style={styles.subtitle}>
            Chào mừng bạn đến với thế giới lập trình di động đa nền tảng!
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Định nghĩa kiểu dáng giao diện bằng StyleSheet (sử dụng Flexbox)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a', // Màu nền tối sang trọng
  },
  container: {
    flex: 1,
    justifyContent: 'center',    // Căn giữa theo trục dọc
    alignItems: 'center',        // Căn giữa theo trục ngang
    padding: 24,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38bdf8',      // Viền xanh ngọc React Native
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,               // Đổ bóng trên Android
    width: '100%',
    maxWidth: 360,
  },
  badge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38bdf8',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default App;
