import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import ProductCard from '../components/ProductCard';
import { EASY_SAMPLE_PRODUCTS } from '../data/products';

/**
 * Màn hình minh họa cho BÀI TẬP MỨC DỄ:
 * - Nhập component ProductCard từ file riêng.
 * - Sử dụng ít nhất 3 lần với 3 bộ dữ liệu sản phẩm khác nhau.
 * - Có khối lý thuyết giải thích chi tiết cơ chế truyền props và tính tái sử dụng.
 */
export default function EasyExerciseScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Tiêu đề & Giới thiệu bài tập */}
      <View style={styles.headerBox}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>BÀI TẬP MỨC DỄ</Text>
        </View>
        <Text style={styles.title}>Danh Sách Sản Phẩm (Props Demo)</Text>
        <Text style={styles.subtitle}>
          Sử dụng component ProductCard độc lập 3 lần với 3 bộ dữ liệu khác nhau.
        </Text>
      </View>

      {/* 3 LẦN SỬ DỤNG COMPONENT ProductCard VỚI 3 DỮ LIỆU KHÁC NHAU */}
      <View style={styles.cardsSection}>
        <Text style={styles.sectionHeading}>1. Sản phẩm thứ nhất:</Text>
        <ProductCard
          name={EASY_SAMPLE_PRODUCTS[0].name}
          price={EASY_SAMPLE_PRODUCTS[0].price}
          image={EASY_SAMPLE_PRODUCTS[0].image}
          category={EASY_SAMPLE_PRODUCTS[0].category}
        />

        <Text style={styles.sectionHeading}>2. Sản phẩm thứ hai:</Text>
        <ProductCard
          name={EASY_SAMPLE_PRODUCTS[1].name}
          price={EASY_SAMPLE_PRODUCTS[1].price}
          image={EASY_SAMPLE_PRODUCTS[1].image}
          category={EASY_SAMPLE_PRODUCTS[1].category}
        />

        <Text style={styles.sectionHeading}>3. Sản phẩm thứ ba:</Text>
        <ProductCard
          name={EASY_SAMPLE_PRODUCTS[2].name}
          price={EASY_SAMPLE_PRODUCTS[2].price}
          image={EASY_SAMPLE_PRODUCTS[2].image}
          category={EASY_SAMPLE_PRODUCTS[2].category}
        />
      </View>

      {/* KHỐI GIẢI THÍCH LÝ THUYẾT THEO YÊU CẦU ĐỀ BÀI */}
      <View style={styles.explanationBox}>
        <Text style={styles.explanationTitle}>📝 Giải Thích Cơ Chế Props & Tái Sử Dụng</Text>
        
        <View style={styles.paragraphContainer}>
          <Text style={styles.pointTitle}>1. Cách Props được truyền từ Cha (Parent) xuống Con (Child):</Text>
          <Text style={styles.explanationText}>
            • Trong React Native, dữ liệu luân chuyển theo luồng một chiều (One-Way Data Flow). Component cha (ở đây là <Text style={styles.codeText}>EasyExerciseScreen</Text>) truyền dữ liệu xuống component con (<Text style={styles.codeText}>ProductCard</Text>) dưới dạng các thuộc tính (props) giống như cú pháp HTML:
            {"\n"}  <Text style={styles.codeSnippet}>{'<ProductCard name="Tên SP" price={180000} />'}</Text>
            {"\n"}• Tại component con, React gom toàn bộ các thuộc tính này vào một JavaScript Object duy nhất làm tham số đầu vào. Ta có thể dùng kỹ thuật Destructuring <Text style={styles.codeText}>{'{ name, price }'}</Text> để trích xuất trực tiếp giá trị và render ra giao diện.
            {"\n"}• Props là <Text style={styles.highlightText}>read-only (bất biến)</Text>, nghĩa là component con không được tự ý sửa đổi giá trị props nhận được từ cha.
          </Text>
        </View>

        <View style={styles.paragraphContainer}>
          <Text style={styles.pointTitle}>2. Vì sao component ProductCard có thể tái sử dụng nhiều lần?</Text>
          <Text style={styles.explanationText}>
            • <Text style={styles.boldText}>Tách biệt Giao diện và Dữ liệu:</Text> <Text style={styles.codeText}>ProductCard</Text> đóng gói toàn bộ cấu trúc giao diện (thẻ, layout, kiểu chữ, màu sắc, đổ bóng) nhưng không bị gắn cứng (hardcode) dữ liệu tĩnh.
            {"\n"}• <Text style={styles.boldText}>Tính linh hoạt cao:</Text> Mỗi lần gọi component với các giá trị <Text style={styles.codeText}>name</Text> và <Text style={styles.codeText}>price</Text> khác nhau, component sẽ tính toán và render ra giao diện đồng nhất nhưng nội dung hoàn toàn mới.
            {"\n"}• <Text style={styles.boldText}>Dễ bảo trì và nâng cấp:</Text> Khi muốn đổi font chữ, màu viền hay bố cục của thẻ sản phẩm, ta chỉ cần chỉnh sửa tại một nơi duy nhất (<Text style={styles.codeText}>ProductCard.js</Text>), tất cả các nơi đang sử dụng component đều tự động được cập nhật.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    paddingBottom: 40,
  },
  headerBox: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeText: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  cardsSection: {
    marginTop: 8,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 2,
  },
  explanationBox: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  explanationTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  paragraphContainer: {
    marginBottom: 14,
  },
  pointTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 6,
  },
  explanationText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 21,
  },
  codeText: {
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#0f172a',
    backgroundColor: '#f1f5f9',
  },
  codeSnippet: {
    fontFamily: 'monospace',
    color: '#0284c7',
    fontWeight: '600',
  },
  highlightText: {
    fontWeight: '700',
    color: '#dc2626',
  },
  boldText: {
    fontWeight: '700',
    color: '#1e293b',
  },
});
