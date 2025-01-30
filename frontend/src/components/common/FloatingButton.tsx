import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { COLORS, shadowStyle } from '@/theme';

interface FloatingButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
}

export function FloatingButton({ icon, onPress }: FloatingButtonProps) {
  return (
    <Pressable
      style={styles.button}
      onPress={onPress}
      android_ripple={{ color: COLORS.primary }}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadowStyle,
  },
}); 