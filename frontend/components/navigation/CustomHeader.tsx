import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/theme';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CustomHeaderProps {
  showBack?: boolean;
  title?: string;
}

export function CustomHeader({ showBack = true, title }: CustomHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
      <View style={styles.headerContent}>
        {showBack && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <View style={styles.iconContainer}>
              <MaterialIcons name="arrow-back" size={24} color={COLORS.dark} />
            </View>
          </TouchableOpacity>
        )}
        {title && (
          <Text style={styles.title}>{title}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginLeft: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginLeft: 16,
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
  },
}); 