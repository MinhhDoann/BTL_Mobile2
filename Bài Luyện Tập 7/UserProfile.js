import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Avatar from './Avatar';

const UserProfile = (props) => {
  return (
    <View style={styles.container}>
      <Avatar imageUrl={props.profileImage} />
      <Text style={styles.name}>{props.name}</Text>
      <Text style={styles.bio}>{props.bio}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 10 },
  name: { fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  bio: { textAlign: 'center', marginTop: 4, color: '#666' },
});

export default UserProfile;