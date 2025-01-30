import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Header } from '@/components/common/Header';
import { Input } from '@/components/common/Input';
import { COLORS } from '@/theme';

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Header title="Search" />
      <View style={styles.content}>
        <Input
          placeholder="Search news..."
          leftIcon="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
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