import React from 'react';
import { 
  Pressable, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  PressableProps 
} from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';
import { COLORS, FONTS } from '@/theme';

interface ButtonProps extends PressableProps {
  title: string;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

export function Button({ 
  title, 
  isLoading, 
  variant = 'primary',
  style,
  ...props 
}: ButtonProps) {
  const { wp, hp } = useResponsive();

  const buttonStyles = {
    primary: {
      backgroundColor: COLORS.primary,
      borderWidth: 0,
    },
    secondary: {
      backgroundColor: COLORS.secondary,
      borderWidth: 0,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: COLORS.primary,
    },
  };

  const textStyles = {
    primary: { color: COLORS.white },
    secondary: { color: COLORS.white },
    outline: { color: COLORS.primary },
  };

  return (
    <Pressable
      style={[
        styles.button,
        buttonStyles[variant],
        { 
          height: hp('6%'),
          paddingHorizontal: wp('4%'),
        },
        style,
      ]}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.white} />
      ) : (
        <Text style={[styles.text, textStyles[variant]]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontFamily: FONTS.medium,
  },
}); 