import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginStatus, setLoginStatus] = useState(null);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      const msg = 'Vui lòng nhập đầy đủ Email/Tên đăng nhập và Mật khẩu!';
      setLoginStatus({ success: false, message: msg });
      if (Platform.OS !== 'web') {
        Alert.alert('Thông báo', msg);
      }
      return;
    }

    const msg = `Đăng nhập thành công với tài khoản: ${email}`;
    setLoginStatus({ success: true, message: msg });
    if (Platform.OS !== 'web') {
      Alert.alert('Thành công', msg);
    }
  };

  const handleForgotPassword = () => {
    const msg = 'Hệ thống đã gửi liên kết khôi phục mật khẩu về email của bạn.';
    setLoginStatus({ success: true, message: msg });
    if (Platform.OS !== 'web') {
      Alert.alert('Quên mật khẩu', msg);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer}>
          {/* 1. TIÊU ĐỀ ỨNG DỤNG & LOGO */}
          <View style={styles.headerBox}>
            <View style={styles.logoBadge}>
              <Ionicons name="shield-checkmark" size={36} color="#ffffff" />
            </View>
            <Text style={styles.appTitle}>DevConnect Pro</Text>
            <Text style={styles.appSubtitle}>
              Chào mừng trở lại! Vui lòng đăng nhập vào tài khoản của bạn.
            </Text>
          </View>

          {/* THÔNG BÁO PHẢN HỒI NẾU CÓ */}
          {loginStatus && (
            <View
              style={[
                styles.alertBox,
                loginStatus.success ? styles.alertSuccess : styles.alertError,
              ]}
            >
              <Ionicons
                name={
                  loginStatus.success
                    ? 'checkmark-circle-outline'
                    : 'alert-circle-outline'
                }
                size={20}
                color={loginStatus.success ? '#15803d' : '#b91c1c'}
              />
              <Text
                style={[
                  styles.alertText,
                  loginStatus.success
                    ? styles.alertTextSuccess
                    : styles.alertTextError,
                ]}
              >
                {loginStatus.message}
              </Text>
            </View>
          )}

          {/* 2. HAI Ô NHẬP THÔNG TIN (EMAIL & PASSWORD) */}
          <View style={styles.formContainer}>
            {/* Ô nhập 1: Email / Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tài khoản / Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#64748b"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="name@example.com hoặc username"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                {email.length > 0 && (
                  <TouchableOpacity onPress={() => setEmail('')}>
                    <Ionicons name="close-circle" size={18} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Ô nhập 2: Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#64748b"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập mật khẩu bí mật"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#64748b"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Tùy chọn Remember Me & DÒNG CHỮ FORGOT PASSWORD */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberRow}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && styles.checkboxActive,
                  ]}
                >
                  {rememberMe && (
                    <Ionicons name="checkmark" size={13} color="#ffffff" />
                  )}
                </View>
                <Text style={styles.rememberText}>Ghi nhớ đăng nhập</Text>
              </TouchableOpacity>

              {/* DÒNG CHỮ "Forgot password" THEO YÊU CẦU ĐỀ BÀI */}
              <TouchableOpacity
                onPress={handleForgotPassword}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* 3. NÚT ĐĂNG NHẬP THEO YÊU CẦU ĐỀ BÀI */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.85}
            >
              <Text style={styles.loginButtonText}>Đăng Nhập</Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color="#ffffff"
                style={styles.buttonArrow}
              />
            </TouchableOpacity>

            {/* Tài khoản gợi ý thử nghiệm nhanh */}
            <View style={styles.demoFillBox}>
              <Text style={styles.demoFillTitle}>Tài khoản mẫu thử nghiệm:</Text>
              <TouchableOpacity
                onPress={() => {
                  setEmail('student@ptit.edu.vn');
                  setPassword('Password123@');
                }}
                style={styles.demoFillBtn}
              >
                <Ionicons name="flash-outline" size={14} color="#2563eb" />
                <Text style={styles.demoFillBtnText}>Điền nhanh thông tin</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* THỐNG KÊ THUỘC TÍNH STYLESHEET ĐÃ DÙNG THEO YÊU CẦU */}
          <View style={styles.checklistCard}>
            <Text style={styles.checklistTitle}>
              📋 Thuộc tính StyleSheet đã sử dụng:
            </Text>
            <View style={styles.tagGrid}>
              {[
                'backgroundColor',
                'fontSize',
                'fontWeight',
                'padding',
                'margin',
                'borderWidth',
                'borderRadius',
                'justifyContent',
                'alignItems',
              ].map((prop, idx) => (
                <View key={idx} style={styles.tagBadge}>
                  <Text style={styles.tagText}>✔ {prop}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// TOÀN BỘ STYLE CHÍNH ĐƯỢC VIẾT BẰNG StyleSheet.create()
const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#f1f5f9', // backgroundColor cơ bản
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center', // justifyContent cơ bản
    alignItems: 'center', // alignItems cơ bản
    padding: 20, // padding cơ bản
  },
  cardContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff', // backgroundColor
    borderRadius: 20, // borderRadius
    borderWidth: 1, // borderWidth
    borderColor: '#e2e8f0',
    padding: 24, // padding
    marginVertical: 12, // margin
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },

  // 1. Header Box
  headerBox: {
    alignItems: 'center', // alignItems
    justifyContent: 'center', // justifyContent
    marginBottom: 24, // margin
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34, // borderRadius
    backgroundColor: '#2563eb', // backgroundColor
    alignItems: 'center', // alignItems
    justifyContent: 'center', // justifyContent
    marginBottom: 12, // margin
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  appTitle: {
    fontSize: 24, // fontSize cơ bản
    fontWeight: '800', // fontWeight cơ bản
    color: '#0f172a',
    letterSpacing: 0.5,
    marginBottom: 6, // margin
  },
  appSubtitle: {
    fontSize: 13, // fontSize
    fontWeight: '400', // fontWeight
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 10, // padding
  },

  // Alert Feedback
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12, // padding
    borderRadius: 10, // borderRadius
    borderWidth: 1, // borderWidth
    marginBottom: 18, // margin
    gap: 8,
  },
  alertSuccess: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  alertError: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  alertText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  alertTextSuccess: {
    color: '#166534',
  },
  alertTextError: {
    color: '#991b1b',
  },

  // 2. Form Inputs
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16, // margin
  },
  inputLabel: {
    fontSize: 13, // fontSize
    fontWeight: '600', // fontWeight
    color: '#334155',
    marginBottom: 6, // margin
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center', // alignItems
    backgroundColor: '#f8fafc', // backgroundColor
    borderWidth: 1.5, // borderWidth
    borderColor: '#cbd5e1',
    borderRadius: 12, // borderRadius
    paddingHorizontal: 12, // padding
    paddingVertical: Platform.OS === 'ios' ? 12 : 4,
  },
  inputIcon: {
    marginRight: 8, // margin
  },
  textInput: {
    flex: 1,
    fontSize: 14, // fontSize
    fontWeight: '400', // fontWeight
    color: '#0f172a',
    paddingVertical: 8, // padding
  },
  eyeIcon: {
    padding: 4, // padding
  },

  // Options: Remember Me & Forgot Password
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // justifyContent
    alignItems: 'center', // alignItems
    marginTop: 2, // margin
    marginBottom: 20, // margin
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4, // borderRadius
    borderWidth: 1.5, // borderWidth
    borderColor: '#94a3b8',
    alignItems: 'center', // alignItems
    justifyContent: 'center', // justifyContent
    marginRight: 8, // margin
    backgroundColor: '#ffffff', // backgroundColor
  },
  checkboxActive: {
    backgroundColor: '#2563eb', // backgroundColor
    borderColor: '#2563eb',
  },
  rememberText: {
    fontSize: 13, // fontSize
    fontWeight: '500', // fontWeight
    color: '#475569',
  },

  // Dòng chữ "Forgot password"
  forgotPasswordText: {
    fontSize: 13, // fontSize
    fontWeight: '600', // fontWeight
    color: '#2563eb',
    textDecorationLine: 'underline',
  },

  // 3. Nút Đăng nhập
  loginButton: {
    backgroundColor: '#2563eb', // backgroundColor
    borderRadius: 12, // borderRadius
    paddingVertical: 14, // padding
    paddingHorizontal: 20, // padding
    alignItems: 'center', // alignItems
    justifyContent: 'center', // justifyContent
    flexDirection: 'row',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 15, // fontSize
    fontWeight: '700', // fontWeight
    color: '#ffffff',
    letterSpacing: 0.4,
  },
  buttonArrow: {
    marginLeft: 8, // margin
  },

  // Điền nhanh thông tin
  demoFillBox: {
    marginTop: 18, // margin
    paddingTop: 14, // padding
    borderTopWidth: 1, // borderWidth
    borderTopColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  demoFillTitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  demoFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    gap: 4,
  },
  demoFillBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },

  // Checklist kiểm tra thuộc tính StyleSheet
  checklistCard: {
    marginTop: 22, // margin
    backgroundColor: '#f8fafc', // backgroundColor
    borderRadius: 12, // borderRadius
    borderWidth: 1, // borderWidth
    borderColor: '#e2e8f0',
    padding: 14, // padding
  },
  checklistTitle: {
    fontSize: 12, // fontSize
    fontWeight: '700', // fontWeight
    color: '#1e293b',
    marginBottom: 8, // margin
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagBadge: {
    backgroundColor: '#e0f2fe', // backgroundColor
    paddingVertical: 3, // padding
    paddingHorizontal: 8, // padding
    borderRadius: 6, // borderRadius
    borderWidth: 1, // borderWidth
    borderColor: '#bae6fd',
    marginRight: 4, // margin
    marginBottom: 4, // margin
  },
  tagText: {
    fontSize: 11, // fontSize
    fontWeight: '600', // fontWeight
    color: '#0369a1',
  },
});
