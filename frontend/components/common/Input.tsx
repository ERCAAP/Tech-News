import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/theme';

interface InputProps extends TextInputProps {
  label?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  darkMode?: boolean;
}

export function Input({
  label,
  leftIcon,
  rightIcon,
  onRightIconPress,
  darkMode,
  style,
  ...props
}: InputProps) {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, darkMode && styles.labelDark]}>
          {label}
        </Text>
      )}
      <View style={[styles.inputContainer, darkMode && styles.inputContainerDark]}>
        {leftIcon && (
          <MaterialIcons
            name={leftIcon as any}
            size={20}
            color={darkMode ? COLORS.white : COLORS.dark}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            darkMode && styles.inputDark,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            style,
          ]}
          placeholderTextColor={darkMode ? COLORS.gray : COLORS.dark}
          {...props}
        />
        {rightIcon && (
          <MaterialIcons
            name={rightIcon as any}
            size={20}
            color={darkMode ? COLORS.white : COLORS.dark}
            style={styles.rightIcon}
            onPress={onRightIconPress}
          />
        )}
      </View>
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
  labelDark: {
    color: COLORS.white,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  inputContainerDark: {
    backgroundColor: COLORS.darkSecondary,
    borderColor: COLORS.darkBackground,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
  },
  inputDark: {
    color: COLORS.white,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  leftIcon: {
    marginLeft: 16,
  },
  rightIcon: {
    marginRight: 16,
  },
}); 