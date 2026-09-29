import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';

// Thay thế bằng Cloud Name và Upload Preset của bạn từ Cloudinary
const CLOUD_NAME = 'o3bfueiz'; 
const UPLOAD_PRESET = 'music_upload'; 

export async function pickAndUploadAudio(): Promise<string | null> {
  try {
    // 1. Chọn file
    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const file = result.assets[0];

    // 2. Chuẩn bị dữ liệu Form
    const data = new FormData();
    
    if (Platform.OS === 'web') {
      // Trên Web, Expo Document Picker trả về object File trong thuộc tính file
      data.append('file', file.file as any);
    } else {
      // Trên App (iOS/Android), dùng uri, name, type
      data.append('file', {
        uri: file.uri,
        name: file.name || 'audio.mp3',
        type: file.mimeType || 'audio/mpeg',
      } as any);
    }

    data.append('upload_preset', UPLOAD_PRESET);
    data.append('resource_type', 'auto'); // Cloudinary tự phát hiện loại file

    // 3. Upload lên Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
      {
        method: 'POST',
        body: data,
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    const resultData = await response.json();

    if (resultData.secure_url) {
      return resultData.secure_url; // Đây là Public URL ai cũng nghe được
    } else {
      throw new Error(resultData.error?.message || 'Upload thất bại');
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export async function pickAndUploadImage(): Promise<string | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'image/*',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const file = result.assets[0];
    const data = new FormData();
    
    if (Platform.OS === 'web') {
      data.append('file', file.file as any);
    } else {
      data.append('file', {
        uri: file.uri,
        name: file.name || 'cover.jpg',
        type: file.mimeType || 'image/jpeg',
      } as any);
    }

    data.append('upload_preset', UPLOAD_PRESET);
    data.append('resource_type', 'auto');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
      {
        method: 'POST',
        body: data,
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    const resultData = await response.json();

    if (resultData.secure_url) {
      return resultData.secure_url;
    } else {
      throw new Error(resultData.error?.message || 'Upload ảnh thất bại');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}
