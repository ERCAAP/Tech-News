import { View, Text, Image, StyleSheet } from 'react-native';
import { User } from '@/types';
import React from 'react';

interface ProfileInfoProps {
  user: User | null;
}

export function ProfileInfo({ user }: ProfileInfoProps) {
  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Please login to view your profile</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user.avatar && (
        <Image 
          source={{ uri: user.avatar }} 
          style={styles.avatar}
        />
      )}
      <Text style={styles.username}>{user.username}</Text>
      <Text style={styles.email}>{user.email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
}); 