import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import ProductCard from '../components/ProductCard';
import { MOCK_PRODUCTS } from '../data/products';

/**
 * Màn hình Product List (Bài tập mức trung bình):
 * - Sử dụng FlatList để hiển thị danh sách 10 sản phẩm
 * - Bấm vào 1 item sẽ chuyển sang màn hình Detail và truyền props/params (id, name, price,...)
 */
export default function ProductListScreen({ onSelectProduct }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  // Danh mục để lọc nhanh
  const categories = ['Tất cả', 'Điện thoại', 'Laptop', 'Tai nghe', 'Đồng hồ', 'Phụ kiện'];

  // Lọc sản phẩm theo từ khoá và danh mục
  const filteredProducts = MOCK_PRODUCTS.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'Tất cả' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Render từng item bằng component ProductCard
  const renderProductItem = ({ item }) => (
    <ProductCard
      name={item.name}
      price={item.price}
      image={item.image}
      category={item.category}
      rating={item.rating}
      onPress={() => {
        // Truyền params: id, name, price, ... sang màn hình Detail theo đúng yêu cầu đề bài
        onSelectProduct({
          id: item.id,
          name: item.name,
          price: item.price,
          formattedPrice: item.formattedPrice,
          image: item.image,
          category: item.category,
          rating: item.rating,
          reviewsCount: item.reviewsCount,
          description: item.description,
          specs: item.specs,
        });
      }}
    />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header thanh tìm kiếm & Danh mục */}
      <View style={styles.headerContainer}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.headerTitle}>TechStore ⚡</Text>
            <Text style={styles.headerSubtitle}>
              Danh sách 10 sản phẩm công nghệ hot nhất (FlatList)
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filteredProducts.length} SP</Text>
          </View>
        </View>

        {/* Ô tìm kiếm */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm (iPhone, Sony, Mac...)"
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Bộ lọc danh mục */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            return (
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* DANH SÁCH SẢN PHẨM SỬ DỤNG FLATLIST */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm nào</Text>
            <Text style={styles.emptySubtitle}>
              Vui lòng thử tìm với từ khoá hoặc danh mục khác.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerContainer: {
    backgroundColor: '#ffffff',
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  countText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },
  clearIcon: {
    fontSize: 14,
    color: '#94a3b8',
    paddingHorizontal: 6,
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#0284c7',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 30,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
});
