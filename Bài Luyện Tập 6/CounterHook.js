
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const CounterHook = () => {
  const [count, setCount] = useState(0);

  return (
    <View style={styles.card}>
      <Text style={styles.text}>Số lần đếm: {count}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Tăng" onPress={() => setCount(count + 1)} color="#2980b9" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginVertical: 5,
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffe0b2',
  },
  text: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#e65100' },
  buttonContainer: { width: 100 },
});

export default CounterHook;