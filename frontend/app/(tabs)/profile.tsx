import { View } from 'react-native';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { useAppSelector } from '../../src/redux/hooks';
import React from 'react';

export default function ProfileScreen() {
  const { user } = useAppSelector(state => state.auth);

  return (
    <View style={{ flex: 1 }}>
      <ProfileInfo user={user} />
    </View>
  );
} 