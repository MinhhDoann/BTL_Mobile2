import { getCoverUrl } from '@/src/lib/cover-image';
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

export interface LibraryItemData {
  id: string | number;
  title: string;
  subtitle: string;
  type?: 'playlist' | 'album' | 'artist' | 'single' | string;
  cover_url?: string | null;
  coverUrl?: string | null;
  isPinned?: boolean;
}

export interface LibraryItemProps {
  item: LibraryItemData;
  layout?: 'list' | 'grid';
  onPress?: (item: LibraryItemData) => void;
  onLongPress?: (item: LibraryItemData) => void;
  style?: ViewStyle;
}

export const LibraryItem: React.FC<LibraryItemProps> = ({
  item,
  layout = 'list',
  onPress,
  onLongPress,
  style,
}) => {
  const imageUrl = getCoverUrl(item.cover_url || item.coverUrl);
  const isArtist = item.type === 'artist';

  if (layout === 'grid') {
    return (
      <TouchableOpacity
        style={[styles.gridContainer, style]}
        onPress={() => onPress?.(item)}
        onLongPress={() => onLongPress?.(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: imageUrl }}
          style={[styles.gridImage, isArtist && styles.artistImage]}
        />
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {item.subtitle}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.listContainer, style]}
      onPress={() => onPress?.(item)}
      onLongPress={() => onLongPress?.(item)}
      activeOpacity={0.7}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: imageUrl }}
          style={[styles.listImage, isArtist && styles.artistImage]}
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // List style (dạng hàng dọc giống Spotify)
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  imageWrapper: {
    marginRight: 14,
  },
  listImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  artistImage: {
    borderRadius: 32, // Tròn cho Nghệ sĩ
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 13,
  },

  // Grid style (dạng lưới)
  gridContainer: {
    flex: 1,
    margin: 8,
    maxWidth: '46%',
  },
  gridImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    marginBottom: 8,
  },
});
