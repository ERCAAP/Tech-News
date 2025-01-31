import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import { FONTS } from '@/theme';

interface CustomTextProps extends TextProps {
  variant?: keyof typeof FONTS;
}

export function Text({ style, variant = 'regular', ...props }: CustomTextProps) {
  return (
    <RNText 
      style={[{ fontFamily: FONTS[variant] }, style]} 
      {...props} 
    />
  );
} 