import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StudentInfo = (props) => {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>Họ tên: {props.name}</Text>
      <Text style={styles.info}>Lớp: {props.className}</Text>
      <Text style={styles.info}>Ngành học: {props.major}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  name: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  info: { fontSize: 16, color: '#666', marginTop: 2 },
});

export default StudentInfo;