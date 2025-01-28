import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

export default function ProfileScreen() {
  const user = useSelector((state: RootState) => state.user);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <Text>Ad: {user.name}</Text>
      <Text>E-posta: {user.email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
  },
});
