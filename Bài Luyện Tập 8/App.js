import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import EasyExerciseScreen from './src/screens/EasyExerciseScreen';
import ProductListScreen from './src/screens/ProductListScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';

export default function App() {
  // Quản lý tab bài tập đang chọn: 'easy' | 'medium'
  const [activeTab, setActiveTab] = useState('medium');

  // Quản lý sản phẩm đang xem chi tiết ở bài tập trung bình
  // null = màn hình ProductList, object = màn hình ProductDetail
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* THANH CHUYỂN ĐỔI BÀI TẬP (TOP TAB SWITCHER) */}
      <View style={styles.navBar}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'easy' && styles.tabButtonActive]}
            onPress={() => {
              setActiveTab('easy');
              setSelectedProduct(null);
            }}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'easy' && styles.tabButtonTextActive,
              ]}
            >
              🟢 Bài Tập Dễ
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'medium' && styles.tabButtonActive]}
            onPress={() => setActiveTab('medium')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'medium' && styles.tabButtonTextActive,
              ]}
            >
              🔵 Bài Tập Trung Bình
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* NỘI DUNG MÀN HÌNH THEO BÀI TẬP */}
      <View style={styles.screenContainer}>
        {activeTab === 'easy' ? (
          /* Màn hình Bài Tập Mức Dễ: Sử dụng 3 ProductCard + Lý thuyết */
          <EasyExerciseScreen />
        ) : (
          /* Màn hình Bài Tập Mức Trung Bình: List FlatList & Detail */
          selectedProduct ? (
            <ProductDetailScreen
              product={selectedProduct}
              onBack={() => setSelectedProduct(null)}
            />
          ) : (
            <ProductListScreen
              onSelectProduct={(product) => setSelectedProduct(product)}
            />
          )
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  navBar: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  tabButtonTextActive: {
    color: '#0f172a',
  },
  screenContainer: {
    flex: 1,
  },
});
