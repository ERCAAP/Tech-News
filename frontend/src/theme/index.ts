import { DefaultTheme } from '@react-navigation/native';

export const COLORS = {
  primary: '#FF6B6B',
  primaryDark: '#2C3E50',
  primaryLight: '#4ECDC4',
  secondary: '#4ECDC4',
  secondaryDark: '#3498DB',
  background: '#F8F9FA',
  darkBackground: '#1A1B1E',
  darkSecondary: '#2D3436',
  white: '#FFFFFF',
  dark: '#212529',
  gray: '#6C757D',
  error: '#DC3545',
  success: '#28A745',
  warning: '#FFC107',
  danger: '#DC3545',
  border: '#E5E5E5',
  black: '#000000',
  gradient: {
    primary: ['#2563EB', '#60A5FA'] as const,
    secondary: ['#10B981', '#34D399'] as const,
    dark: ['#1F2937', '#374151'] as const,
    light: ['#F3F4F6', '#F9FAFB'] as const,
  },
};

export const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  bold: 'Inter_700Bold',
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
};

export const SIZES = {
  base: 8,
  small: 12,
  font: 14,
  medium: 16,
  large: 18,
  extraLarge: 24,
};

// Basit gölge stilleri
export const shadowStyle = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 5,
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...COLORS,
  },
};

export const ANIMATION = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeInOut: 'easeInOut',
    easeIn: 'easeIn',
    easeOut: 'easeOut',
  },
}; 