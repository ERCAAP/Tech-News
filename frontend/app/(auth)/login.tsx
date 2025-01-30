import React, { useState } from 'react';
import { View, StyleSheet, Alert, Animated, TouchableOpacity, Image } from 'react-native';
import { useAppDispatch } from '@/redux/hooks';
import { login } from '@/redux/slices/authSlice';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Link, router } from 'expo-router';
import { COLORS, FONTS, shadowStyle } from '@/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(
    (systemColorScheme as 'light' | 'dark') ?? 'light'
  );
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  React.useEffect(() => {
    loadThemePreference();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setColorScheme(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

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

  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header Section */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <TouchableOpacity 
          style={styles.themeToggle}
          onPress={toggleTheme}
        >
          <MaterialIcons 
            name={isDark ? 'light-mode' : 'dark-mode'} 
            size={24} 
            color={isDark ? COLORS.white : COLORS.dark}
          />
        </TouchableOpacity>
        
        <Image 
          source={require('../../../frontend/assets/images/news-logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Form Section */}
      <Animated.View 
        style={[
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
        ]}
      >
        <View style={[styles.formContainer, isDark && styles.formContainerDark]}>
          <Input
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail"
            darkMode={isDark}
          />

          <Input
            label="Password"
            value={formData.password}
            onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
            placeholder="Enter your password"
            secureTextEntry
            leftIcon="lock"
            darkMode={isDark}
          />

          <Button
            title={isLoading ? "Logging in..." : "Login"}
            onPress={handleLogin}
            disabled={isLoading}
            style={styles.button}
            isLoading={isLoading}
            darkMode={isDark}
          />

          <Link 
            href="/(auth)/register" 
            style={[styles.link, isDark && styles.linkDark]}
          >
            Don't have an account? Register
          </Link>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  containerDark: {
    backgroundColor: COLORS.darkBackground,
  },
  header: {
    height: 120,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...shadowStyle,
  },
  headerDark: {
    backgroundColor: COLORS.primaryDark,
  },
  logo: {
    width: 150,
    height: 60,
    tintColor: COLORS.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 16,
    ...shadowStyle,
  },
  formContainerDark: {
    backgroundColor: COLORS.darkSecondary,
  },
  button: {
    marginTop: 24,
  },
  link: {
    marginTop: 16,
    textAlign: 'center',
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    fontSize: 16,
  },
  linkDark: {
    color: COLORS.primaryLight,
  },
  themeToggle: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    zIndex: 1,
  },
}); 