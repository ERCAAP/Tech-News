import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert, 
  Animated, 
  Image, 
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useAppDispatch } from '@/redux/hooks';
import { register } from '@/redux/slices/authSlice';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Link, router } from 'expo-router';
import { COLORS, FONTS, shadowStyle } from '@/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Card } from '@/components/common/Card';
import { FloatingButton } from '@/components/common/FloatingButton';
import { useAppSelector } from '@/redux/hooks';
import { toggleTheme } from '@/redux/slices/themeSlice';

export default function RegisterScreen() {
  const dispatch = useAppDispatch();
  const { isDark } = useAppSelector(state => state.theme);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const slideAnim = useState(new Animated.Value(0))[0];

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 12,
      bounciness: 8,
    }).start();
  }, []);

  const handleRegister = async () => {
    try {
      setIsLoading(true);
      if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      await dispatch(register(formData)).unwrap();
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Registration Error',
        error.message || 'Failed to register. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={[
        StyleSheet.absoluteFill,
        { backgroundColor: isDark ? COLORS.darkBackground : COLORS.primary }
      ]} />

      <FloatingButton
        icon="light-mode"
        onPress={() => dispatch(toggleTheme())}
        position="topRight"
        darkMode={isDark}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[
            styles.content,
            {
              opacity: slideAnim,
              transform: [{
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                })
              }]
            }
          ]}>
            <Image 
              source={require('../../assets/images/news-logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />

            <Card
              variant="elevated"
              darkMode={isDark}
              style={styles.formCard}
            >
              <Input
                label="First Name"
                value={formData.firstName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
                placeholder="Enter your first name"
                leftIcon="person"
                darkMode={isDark}
                variant="outlined"
              />

              <Input
                label="Last Name"
                value={formData.lastName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
                placeholder="Enter your last name"
                leftIcon="person"
                darkMode={isDark}
                variant="outlined"
              />

              <Input
                label="Email"
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail"
                darkMode={isDark}
                variant="outlined"
              />

              <Input
                label="Password"
                value={formData.password}
                onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                placeholder="Enter your password"
                secureTextEntry
                leftIcon="lock"
                darkMode={isDark}
                variant="outlined"
              />

              <Input
                label="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                placeholder="Confirm your password"
                secureTextEntry
                leftIcon="lock"
                darkMode={isDark}
                variant="outlined"
              />

              <Button
                title={isLoading ? "Creating Account..." : "Create Account"}
                onPress={handleRegister}
                disabled={isLoading}
                style={styles.button}
                isLoading={isLoading}
                darkMode={isDark}
                variant="primary"
                fullWidth
              />

              <Link 
                href="/(auth)/login" 
                style={[styles.link, isDark && styles.linkDark]}
              >
                Already have an account? Login
              </Link>
            </Card>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerDark: {
    backgroundColor: COLORS.darkBackground,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  logo: {
    width: 200,
    height: 80,
    alignSelf: 'center',
    marginBottom: 32,
    tintColor: COLORS.white,
  },
  formCard: {
    padding: 24,
  },
  button: {
    marginTop: 24,
  },
  link: {
    marginTop: 16,
    textAlign: 'center',
    color: COLORS.white,
    fontFamily: FONTS.medium,
    fontSize: FONTS.sizes.md,
  },
  linkDark: {
    color: COLORS.primaryLight,
  },
}); 