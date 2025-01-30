import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { COLORS, shadowStyle } from '@/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'elevated' | 'outlined';
  darkMode?: boolean;
}

export function Card({ 
  children, 
  style, 
  variant = 'elevated',
  darkMode,
}: CardProps) {
  const cardStyle = variant === 'outlined' 
    ? styles.outlinedCard 
    : styles.elevatedCard;

  return (
    <View style={[
      styles.card,
      cardStyle,
      darkMode && styles.darkCard,
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
  },
  elevatedCard: {
    backgroundColor: COLORS.white,
    ...shadowStyle,
  },
  outlinedCard: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  darkCard: {
    backgroundColor: COLORS.darkSecondary,
  },
}); 