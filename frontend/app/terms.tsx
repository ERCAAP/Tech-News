import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '@/theme';
import { Header } from '@/components/common/Header';

export default function TermsScreen() {
  return (
    <View style={styles.container}>
      <Header title="Terms of Use" showBack />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Terms and Conditions</Text>
        <Text style={styles.text}>
          Welcome to Tech News! These terms and conditions outline the rules and regulations for the use of our service.
        </Text>
        {/* Buraya terms içeriği eklenecek */}
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