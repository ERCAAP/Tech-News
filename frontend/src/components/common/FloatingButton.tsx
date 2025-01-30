import React from 'react';
import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { COLORS, shadowStyle } from '@/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface FloatingButtonProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  position: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft';
  darkMode?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function FloatingButton({ 
  icon, 
  onPress, 
  position = 'bottomRight',
  darkMode,
  style 
}: FloatingButtonProps) {
  const positionStyle = {
    topRight: { top: 16, right: 16 },
    topLeft: { top: 16, left: 16 },
    bottomRight: { bottom: 16, right: 16 },
    bottomLeft: { bottom: 16, left: 16 },
  }[position];

  return (
    <Pressable
      style={[
        styles.button,
        positionStyle,
        darkMode && styles.buttonDark,
        style
      ]}
      onPress={onPress}
      android_ripple={{ color: COLORS.primary }}
    >
      <MaterialIcons 
        name={icon}
        size={24}
        color={darkMode ? COLORS.white : COLORS.white}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadowStyle,
  },
  buttonDark: {
    backgroundColor: COLORS.primaryDark,
  },
}); 