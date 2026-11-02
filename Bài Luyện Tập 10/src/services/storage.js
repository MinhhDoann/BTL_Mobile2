import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEY = '@mini_app_saved_entries';

/**
 * Storage Service hỗ trợ cả React Native Native và Web (AsyncStorage / localStorage)
 */
export const StorageService = {
  // Lấy toàn bộ danh sách đã lưu
  getSavedEntries: async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        return JSON.parse(jsonValue);
      }
      // Fallback web nếu AsyncStorage chưa khởi tạo
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        const local = window.localStorage.getItem(STORAGE_KEY);
        return local ? JSON.parse(local) : [];
      }
      return [];
    } catch (e) {
      console.warn('Lỗi khi đọc dữ liệu từ AsyncStorage:', e);
      return [];
    }
  },

  // Lưu một bản ghi mới vào danh sách
  saveEntry: async (entry) => {
    try {
      const currentList = await StorageService.getSavedEntries();
      const updatedList = [entry, ...currentList];
      const jsonValue = JSON.stringify(updatedList);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);

      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, jsonValue);
      }
      return true;
    } catch (e) {
      console.error('Lỗi khi lưu vào AsyncStorage:', e);
      throw e;
    }
  },

  // Xóa một bản ghi theo ID
  deleteEntry: async (id) => {
    try {
      const currentList = await StorageService.getSavedEntries();
      const updatedList = currentList.filter((item) => item.id !== id);
      const jsonValue = JSON.stringify(updatedList);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);

      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, jsonValue);
      }
      return updatedList;
    } catch (e) {
      console.error('Lỗi khi xóa bản ghi:', e);
      throw e;
    }
  },

  // Xóa toàn bộ dữ liệu đã lưu
  clearAllEntries: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      return true;
    } catch (e) {
      console.error('Lỗi khi dọn dẹp AsyncStorage:', e);
      throw e;
    }
  },
};
