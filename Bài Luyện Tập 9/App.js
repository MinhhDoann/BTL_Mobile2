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
import LoginScreen from './src/screens/LoginScreen';
import ProfileSettingsScreen from './src/screens/ProfileSettingsScreen';

export default function App() {
  // Quản lý tab bài tập đang chọn: 'bai1' | 'bai2'
  const [activeTab, setActiveTab] = useState('bai1');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* THANH CHUYỂN ĐỔI BÀI TẬP (TOP SWITCHER) */}
      <View style={styles.navBar}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.appHeaderTitle}>BÀI THỰC HÀNH 9: REACT NATIVE UI</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'bai1' && styles.tabButtonActive]}
            onPress={() => setActiveTab('bai1')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'bai1' && styles.tabButtonTextActive,
              ]}
            >
              🟢 Bài 1: Màn hình Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'bai2' && styles.tabButtonActive]}
            onPress={() => setActiveTab('bai2')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'bai2' && styles.tabButtonTextActive,
              ]}
            >
              🔵 Bài 2: Profile & Settings
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* NỘI DUNG MÀN HÌNH THEO BÀI TẬP */}
      <View style={styles.screenContainer}>
        {activeTab === 'bai1' ? (
          <LoginScreen />
        ) : (
          <ProfileSettingsScreen />
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
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitleRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  appHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#3b82f6',
    letterSpacing: 0.8,
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
