import React from 'react';
import { Text, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, shadowStyle } from '@/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
      </View>
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Terms of Use</Text>
        <Text style={styles.date}>Last Updated: February 1, 2025</Text>
        
        <Text style={styles.text}>
          These Terms of Use govern the use of the services provided by Tech News ("we", "our", or "us"). 
          By using our application, you agree to these terms.
        </Text>

        <Text style={styles.sectionTitle}>1. Service Description</Text>
        <Text style={styles.text}>
          Tech News is a platform that allows users to read news. The application does not permit users to 
          create or share content.
        </Text>

        <Text style={styles.sectionTitle}>2. User Responsibilities</Text>
        <Text style={styles.text}>
          Users must adhere to the following rules while using the application:{'\n'}
          • Act in accordance with the law.{'\n'}
          • Respect the rights of others.{'\n'}
          • Do not share harmful content through the application.
        </Text>

        <Text style={styles.sectionTitle}>3. Account Security</Text>
        <Text style={styles.text}>
          Users are responsible for the security of their accounts. Account information should not be shared with anyone.
        </Text>

        <Text style={styles.sectionTitle}>4. Intellectual Property</Text>
        <Text style={styles.text}>
          The application and its content are protected by copyright and other intellectual property rights. 
          By using the application, you agree to respect these rights.
        </Text>

        <Text style={styles.sectionTitle}>5. Disclaimer</Text>
        <Text style={styles.text}>
          The application does not guarantee the accuracy or reliability of the content. Users use the application 
          at their own risk.
        </Text>

        <Text style={styles.sectionTitle}>6. Changes</Text>
        <Text style={styles.text}>
          We may update these Terms of Use from time to time. We will notify you of any changes.
        </Text>

        <Text style={styles.sectionTitle}>7. Contact</Text>
        <Text style={styles.text}>
          If you have any questions about these Terms of Use, please contact us at:{'\n'}
          Email: ercaanp@gmail.com
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    ...shadowStyle,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginTop: 24,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
    lineHeight: 24,
  },
}); 