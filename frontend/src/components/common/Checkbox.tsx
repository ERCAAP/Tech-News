import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
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
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.checkbox,
        checked && styles.checked,
        darkMode && styles.checkboxDark,
        checked && darkMode && styles.checkedDark
      ]}>
        {checked && (
          <MaterialIcons 
            name="check" 
            size={16} 
            color={checked ? COLORS.white : COLORS.gray} 
          />
        )}
      </View>
      {label && (
        <Text style={[
          styles.label,
          darkMode && styles.labelDark
        ]}>
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
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxDark: {
    borderColor: COLORS.primaryLight,
  },
  checked: {
    backgroundColor: COLORS.primary,
  },
  checkedDark: {
    backgroundColor: COLORS.primaryLight,
  },
  label: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.dark,
  },
  labelDark: {
    color: COLORS.white,
  },
}); 