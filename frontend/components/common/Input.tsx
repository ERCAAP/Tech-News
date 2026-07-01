import React from 'react';
import { TextInput, TextInputProps, StyleSheet, View, Text, ViewStyle } from 'react-native';
import { COLORS, FONTS } from '@/theme';

export interface InputProps {
  label?: string;
  error?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  style?: TextInputProps['style'];
  containerStyle?: ViewStyle;
}

export function Input({ 
  label, 
  error, 
  style,
  maxLength,
  multiline,
  containerStyle,
  ...props 
}: InputProps & Omit<TextInputProps, keyof InputProps>) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input, 
          error && styles.inputError,
          multiline && styles.multilineInput,
          style
        ]}
        placeholderTextColor={COLORS.gray}
        maxLength={maxLength}
        multiline={multiline}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: COLORS.dark,
    marginBottom: 8,
    fontFamily: FONTS.medium,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.dark,
    fontFamily: FONTS.regular,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginTop: 4,
    fontFamily: FONTS.regular,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
}); 