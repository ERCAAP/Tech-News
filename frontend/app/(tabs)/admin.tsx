import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { CreateNewsForm } from '@/components/admin/CreateNewsForm';
import { useAppSelector } from '@/redux/hooks';
import { isUserAdmin } from '@/types';
import { COLORS } from '@/theme';
import { router } from 'expo-router';

export default function AdminScreen() {
  const { user } = useAppSelector(state => state.auth);

  // Admin değilse ana sayfaya yönlendir
  if (!user || !isUserAdmin(user)) {
    router.replace('/(tabs)');
    return null;
  }

  return (
    <ScrollView style={styles.container}>

      <View style={styles.content}>
        <CreateNewsForm />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
}); 