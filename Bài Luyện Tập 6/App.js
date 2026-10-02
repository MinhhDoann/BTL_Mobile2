import React from 'react';
import { SafeAreaView, ScrollView, Text, StyleSheet, View } from 'react-native';


import Greeting from './Greeting';
import StudentInfo from './StudentInfo';
import CounterHook from './CounterHook';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Phần hiển thị BÀI TẬP 1 */}
        <View style={styles.section}>
          <Text style={styles.header}>BÀI 1: GREETING</Text>
          <Greeting name="Nguyễn Văn A" />
          <Greeting name="Trần Thị B" />
        </View>

        {/* Phần hiển thị BÀI TẬP 2 */}
        <View style={styles.section}>
          <Text style={styles.header}>BÀI 2: STUDENT INFO</Text>
          <StudentInfo name="Lê Văn C" className="IT1" major="Công nghệ thông tin" />
          <StudentInfo name="Phạm Thị D" className="KT2" major="Kế toán" />
        </View>

        {/* Phần hiển thị BÀI TẬP 3 */}
        <View style={styles.section}>
          <Text style={styles.header}>BÀI 3: COUNTER HOOK</Text>
          <CounterHook />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  scrollContent: {
    padding: 15,
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2, // Tạo bóng đổ nhẹ trên Android
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
});

export default App;