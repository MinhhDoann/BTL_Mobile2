import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, StyleSheet, View, TextInput, Button } from 'react-native';
import UserProfile from './UserProfile';

export default function App() {
  // State Bài 1
  const [nameEx1, setNameEx1] = useState('');

  // State Bài 3
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateEmail = (emailStr) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(emailStr);
  };

  const handleSubmit = () => {
    setError('');
    setSuccessMessage('');

    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Email không đúng định dạng.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setSuccessMessage('Đăng ký thành công');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* BÀI TẬP 1 */}
        <View style={styles.section}>
          <Text style={styles.header}>BÀI 1: NHẬP HỌ TÊN (CONTROLLED COMPONENT)</Text>
          <TextInput
            style={styles.input}
            value={nameEx1}
            onChangeText={(text) => setNameEx1(text)}
            placeholder="Nhập họ tên của bạn..."
          />
          <Text style={styles.textResult}>Bạn đã nhập: {nameEx1}</Text>
        </View>

        {/* BÀI TẬP 2 */}
        <View style={styles.section}>
          <Text style={styles.header}>BÀI 2: DANH SÁCH HỒ SƠ (LỒNG COMPONENT)</Text>
          <UserProfile
            name="Nguyễn Văn A"
            bio="Lập trình viên React Native"
            profileImage="https://via.placeholder.com/150"
          />
          <UserProfile
            name="Trần Thị B"
            bio="Nhà thiết kế UI/UX"
            profileImage="https://via.placeholder.com/150"
          />
        </View>

        {/* BÀI TẬP 3 */}
        <View style={styles.section}>
          <Text style={styles.header}>BÀI 3: FORM ĐĂNG KÝ & VALIDATE</Text>
          <TextInput
            style={styles.input}
            placeholder="Họ tên"
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

          <Button title="Submit" onPress={handleSubmit} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 6,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  textResult: {
    fontSize: 15,
    color: '#333',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  successText: {
    color: 'green',
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});