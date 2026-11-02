import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MiniAppCreateScreen from './MiniAppCreateScreen';
import MiniAppSavedScreen from './MiniAppSavedScreen';

export default function MiniAppContainer() {
  const [subTab, setSubTab] = useState('create'); // 'create' | 'saved'

  return (
    <View style={styles.container}>
      {/* Sub navigation bar for Bài tập 2 */}
      <View style={styles.subNavBar}>
        <TouchableOpacity
          style={[styles.subTabBtn, subTab === 'create' && styles.subTabBtnActive]}
          onPress={() => setSubTab('create')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={subTab === 'create' ? 'create' : 'create-outline'}
            size={16}
            color={subTab === 'create' ? '#2563eb' : '#64748b'}
          />
          <Text
            style={[
              styles.subTabText,
              subTab === 'create' && styles.subTabTextActive,
            ]}
          >
            1. Chọn Ảnh, Vị Trí & Lưu
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, subTab === 'saved' && styles.subTabBtnActive]}
          onPress={() => setSubTab('saved')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={subTab === 'saved' ? 'folder-open' : 'folder-open-outline'}
            size={16}
            color={subTab === 'saved' ? '#2563eb' : '#64748b'}
          />
          <Text
            style={[
              styles.subTabText,
              subTab === 'saved' && styles.subTabTextActive,
            ]}
          >
            2. Saved Data (Đọc Dữ Liệu)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Screen Content */}
      <View style={styles.content}>
        {subTab === 'create' ? (
          <MiniAppCreateScreen onNavigateToSaved={() => setSubTab('saved')} />
        ) : (
          <MiniAppSavedScreen onNavigateToCreate={() => setSubTab('create')} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  subNavBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 8,
  },
  subTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    gap: 6,
  },
  subTabBtnActive: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  subTabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748b',
  },
  subTabTextActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
});
