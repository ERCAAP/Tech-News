import React from 'react';
import { 
  TextInput, 
  TextInputProps, 
  StyleSheet, 
  View, 
  Text 
} from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';
import { COLORS, FONTS } from '@/theme';

interface InputProps extends TextInputProps {
  label?: string;
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
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          { 
            height: hp('6%'),
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