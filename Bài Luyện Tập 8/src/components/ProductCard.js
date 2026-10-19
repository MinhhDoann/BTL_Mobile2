import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';

/**
 * Component ProductCard - Dùng để hiển thị thông tin sản phẩm dạng thẻ (Card)
 * 
 * @param {Object} props
 * @param {string} props.name - Tên của sản phẩm (Bắt buộc theo đề bài)
 * @param {string|number} props.price - Giá sản phẩm (Bắt buộc theo đề bài)
 * @param {string} [props.image] - Link hình ảnh sản phẩm (tuỳ chọn)
 * @param {string} [props.category] - Danh mục sản phẩm (tuỳ chọn)
 * @param {number} [props.rating] - Đánh giá sao (tuỳ chọn)
 * @param {function} [props.onPress] - Hàm callback khi click vào thẻ sản phẩm (dành cho Bài tập Trung Bình)
 */
export default function ProductCard({
  name,
  price,
  image,
  category,
  rating,
  onPress,
}) {
  // Định dạng hiển thị giá tiền
  const formatPrice = (value) => {
    if (typeof value === 'number') {
      return value.toLocaleString('vi-VN') + ' ₫';
    }
    return value;
  };

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {/* Ảnh sản phẩm (nếu có) */}
      {image && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="cover"
          />
          {category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          )}
        </View>
      )}

      {/* Thông tin sản phẩm */}
      <View style={styles.contentContainer}>
        {/* Tên sản phẩm (Bắt buộc) */}
        <Text style={styles.productName} numberOfLines={2}>
          {name}
        </Text>

        {/* Rating & Review nếu có */}
        {rating && (
          <View style={styles.ratingRow}>
            <Text style={styles.starIcon}>★</Text>
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        )}

        {/* Giá sản phẩm (Bắt buộc) */}
        <View style={styles.footerRow}>
          <View>
            <Text style={styles.priceLabel}>Giá bán:</Text>
            <Text style={styles.productPrice}>{formatPrice(price)}</Text>
          </View>

          {onPress && (
            <View style={styles.viewDetailBtn}>
              <Text style={styles.viewDetailText}>Chi tiết →</Text>
            </View>
          )}
        </View>
      </View>
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    overflow: 'hidden',
    // Hiệu ứng đổ bóng chuẩn trên cả iOS và Android
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#f1f5f9',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: 22,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  starIcon: {
    color: '#f59e0b',
    fontSize: 14,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  priceLabel: {
    fontSize: 11,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0284c7', // Xanh công nghệ hiện đại
    marginTop: 2,
  },
  viewDetailBtn: {
    backgroundColor: '#eff6ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  viewDetailText: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '700',
  },
});
