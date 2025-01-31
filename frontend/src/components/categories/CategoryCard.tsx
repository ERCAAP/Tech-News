import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/theme';

interface CategoryCardProps {
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  newsCount: number;
}

export function CategoryCard({ title, icon, newsCount }: CategoryCardProps) {
  return (
    <View style={styles.card}>
      <MaterialIcons name={icon} size={24} color={COLORS.primary} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.count}>{newsCount} News</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
    minWidth: 120,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    marginTop: 8,
    textAlign: 'center',
  },
  count: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginTop: 4,
  },
}); 