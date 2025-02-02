import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/theme';

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  label?: string;
  darkMode?: boolean;
}

export function Checkbox({ checked, onPress, label, darkMode }: CheckboxProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <MaterialIcons
        name={checked ? 'check-box' : 'check-box-outline-blank'}
        size={24}
        color={darkMode ? COLORS.white : COLORS.dark}
      />
      {label && (
        <Text style={[styles.label, darkMode && styles.labelDark]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
  },
  labelDark: {
    color: COLORS.white,
  },
}); 