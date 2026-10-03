import { StyleSheet, Text, View } from 'react-native';

const Greeting = (props) => {
  return (
    <View style={styles.card}>
      {/* Hiển thị dữ liệu name được truyền từ Component cha */}
      <Text style={styles.text}>Xin chào, {props.name}!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#e0f7fa', // Màu nền xanh nhạt
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b2ebf2',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#006064',
  },
});

export default Greeting;