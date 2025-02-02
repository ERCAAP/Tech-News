import React from 'react';
import { 
  TextInput, 
  StyleSheet, 
  View, 
  Text,
  StyleProp,
  TextStyle,
  ViewStyle
} from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';
import { COLORS, FONTS } from '@/theme';

export interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'web-search';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  darkMode?: boolean;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  error?: string;
}

export function Input({ 
  label, 
  error, 
  style,
  ...props 
}: InputProps) {
  const { wp, hp } = useResponsive();

  return (
    <View style={[styles.container, props.containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          { 
            height: props.multiline ? undefined : hp('6%'),
            paddingHorizontal: wp('4%'),
          },
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={COLORS.gray}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 16,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  error: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.danger,
    marginTop: 4,
  },
}); 