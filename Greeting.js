import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Greeting = (props) => {
  return (
    <View style={styles.card}>
      <Text style={styles.text}>Xin chào, {props.name}!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#e0f7fa',
    borderRadius: 8,
    alignItems: 'center',
  },
  text: { fontSize: 16, fontWeight: 'bold', color: '#006064' },
});

export default Greeting;