import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { useAppSelector } from '@/redux/hooks';
import { COLORS } from '@/theme';

export default function ProfileScreen() {
  const { user } = useAppSelector(state => state.auth);

  return (
    <View style={styles.container}>
      <ProfileInfo user={user} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
}); 