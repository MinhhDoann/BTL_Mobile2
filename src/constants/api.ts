import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Tự động xác định URL Backend Server phù hợp với mọi môi trường:
 * - Web: http://localhost:3000
 * - Android Emulator: http://10.0.2.2:3000
 * - Expo Go (Điện thoại thật cùng WiFi): http://<IP_Máy_Tính>:3000
 */
export const getApiBaseUrl = (): string => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }

  // Lấy IP của máy tính host từ Expo Config khi chạy Expo Go trên máy thật
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhostIp = debuggerHost ? debuggerHost.split(':')[0] : null;

  if (localhostIp && localhostIp !== 'localhost' && localhostIp !== '127.0.0.1') {
    return `http://${localhostIp}:3000`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  return 'http://localhost:3000';
};

export const API_BASE_URL = getApiBaseUrl();
