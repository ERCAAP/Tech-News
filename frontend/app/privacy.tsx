import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '@/theme';
import { Header } from '@/components/common/Header';

export default function PrivacyScreen() {
  return (
    <View style={styles.container}>
      <Header title="Privacy Policy" showBack />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.text}>
          Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information.
        </Text>
        {/* Buraya privacy policy içeriği eklenecek */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
    lineHeight: 24,
  },
}); 