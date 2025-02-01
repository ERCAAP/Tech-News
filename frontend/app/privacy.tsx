import React from 'react';
import { Text, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, shadowStyle } from '@/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function PrivacyScreen() {
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
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.date}>Last Updated: February 1, 2025</Text>
        
        <Text style={styles.text}>
          This Privacy Policy explains how Tech News ("we", "our", or "us") collects, uses, and shares your personal information. 
          By using our application, you agree to this policy.
        </Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.text}>
          • Personal Information: We collect information such as your email address, name, and surname.{'\n'}
          • Usage Data: Information about how you use the application (e.g., login times, click data).{'\n'}
          • Device Information: Information about your device type, operating system, IP address, etc.
        </Text>

        <Text style={styles.sectionTitle}>2. Use of Information</Text>
        <Text style={styles.text}>
          We may use the information we collect for the following purposes:{'\n'}
          • To provide and maintain the application.{'\n'}
          • To improve user experience.{'\n'}
          • To communicate with users.{'\n'}
          • To comply with legal obligations.
        </Text>

        <Text style={styles.sectionTitle}>3. Information Sharing</Text>
        <Text style={styles.text}>
          We do not share your personal information with third parties, except in the following circumstances:{'\n'}
          • Legal requirements.{'\n'}
          • With user consent.
        </Text>

        <Text style={styles.sectionTitle}>4. Security</Text>
        <Text style={styles.text}>
          We take appropriate security measures to protect your personal information. However, we cannot guarantee 
          the complete security of data transmitted over the internet.
        </Text>

        <Text style={styles.sectionTitle}>5. User Rights</Text>
        <Text style={styles.text}>
          Users have the right to request access to, correction of, or deletion of their personal information. 
          You can exercise these rights by contacting us.
        </Text>

        <Text style={styles.sectionTitle}>6. Changes</Text>
        <Text style={styles.text}>
          We may update this Privacy Policy from time to time. We will notify you of any changes.
        </Text>

        <Text style={styles.sectionTitle}>7. Contact</Text>
        <Text style={styles.text}>
          If you have any questions about this Privacy Policy, please contact us at:{'\n'}
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