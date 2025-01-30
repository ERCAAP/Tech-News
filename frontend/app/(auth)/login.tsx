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
import { login } from '@/redux/slices/authSlice';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Link, router } from 'expo-router';
import { COLORS, FONTS, shadowStyle } from '@/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card } from '@/components/common/Card';
import { FloatingButton } from '@/components/common/FloatingButton';
import { useAppSelector } from '@/redux/hooks';
import { toggleTheme } from '@/redux/slices/themeSlice';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { isDark } = useAppSelector(state => state.theme);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      if (!formData.email || !formData.password) {
        Alert.alert('Error', 'Please enter email and password');
        return;
      }
      
      await dispatch(login(formData)).unwrap();
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Login Error',
        error.message || 'Failed to login. Please check your credentials.'
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
              opacity: fadeAnim,
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
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

              <Button
                title={isLoading ? "Logging in..." : "Login"}
                onPress={handleLogin}
                disabled={isLoading}
                style={styles.button}
                isLoading={isLoading}
                darkMode={isDark}
                variant="primary"
                fullWidth
              />

              <Link 
                href="/(auth)/register" 
                style={[styles.link, isDark && styles.linkDark]}
              >
                Don't have an account? Register
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