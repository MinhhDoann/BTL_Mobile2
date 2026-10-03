import { StyleSheet, Text, View } from 'react-native';

const Greeting = (props) => { 
  return ( 
    <View style={styles.container}>
      <Text style={styles.text}>Xin chào, {props.name}!</Text> 
    </View> 
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10, 
    backgroundColor: '#e0f7fa', 
    borderRadius: 5, 
  }, 
  text: {
    fontSize: 16, 
    fontWeight: 'bold', 
  }, 
});

export default Greeting;