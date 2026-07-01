import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/theme';
import { useResponsive } from '@/hooks/useResponsive';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
}

export function Header({ 
  title, 
  showBack, 
  onBack, 
  rightIcon, 
  onRightPress 
}: HeaderProps) {
  const { wp } = useResponsive();

  return (
    <View style={styles.container}>
      {showBack && (
        <Pressable onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.dark} />
        </Pressable>
      )}
      
      <Text style={styles.title}>{title}</Text>

      {rightIcon && (
        <Pressable onPress={onRightPress} style={styles.rightButton}>
          <MaterialIcons name={rightIcon as any} size={24} color={COLORS.dark} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
  },
  rightButton: {
    marginLeft: 16,
  },
}); 