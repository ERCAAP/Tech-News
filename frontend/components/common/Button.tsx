import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'solid' | 'outline';
  disabled?: boolean;
  isLoading?: boolean;
  icon?: string;
  style?: any;
  darkMode?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'solid',
  disabled,
  isLoading,
  icon,
  style,
  darkMode,
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'outline' && styles.outlineButton,
        darkMode && styles.buttonDark,
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <>
          {icon && (
            <MaterialIcons
              name={icon as any}
              size={20}
              color={variant === 'outline' ? COLORS.primary : COLORS.white}
              style={styles.icon}
            />
          )}
          <Text
            style={[
              styles.text,
              variant === 'outline' && styles.outlineText,
              darkMode && styles.textDark,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  buttonDark: {
    backgroundColor: COLORS.primaryDark,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  textDark: {
    color: COLORS.white,
  },
  outlineText: {
    color: COLORS.primary,
  },
  icon: {
    marginRight: 8,
  },
}); 