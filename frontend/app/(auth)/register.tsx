import React, { useState } from 'react';
import { View, StyleSheet, Alert, Animated, TouchableOpacity, Image } from 'react-native';
import { useAppDispatch } from '@/redux/hooks';
import { register } from '@/redux/slices/authSlice';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Link, router } from 'expo-router';
import { COLORS, FONTS, shadowStyle } from '@/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen() {
  const dispatch = useAppDispatch();
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(
    (systemColorScheme as 'light' | 'dark') ?? 'light'
  );
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const slideAnim = useState(new Animated.Value(0))[0];

  React.useEffect(() => {
    loadThemePreference();
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 12,
      bounciness: 8,
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
      <Animated.ScrollView 
        style={[
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
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.formContainer, isDark && styles.formContainerDark]}>
          <Input
            label="First Name"
            value={formData.firstName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
            placeholder="Enter your first name"
            leftIcon="person"
            darkMode={isDark}
          />

          <Input
            label="Last Name"
            value={formData.lastName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
            placeholder="Enter your last name"
            leftIcon="person"
            darkMode={isDark}
          />

          <Input
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="email"
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

          <Input
            label="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
            placeholder="Confirm your password"
            secureTextEntry
            leftIcon="lock"
            darkMode={isDark}
          />

          <Button
            title={isLoading ? "Creating Account..." : "Create Account"}
            onPress={handleRegister}
            disabled={isLoading}
            style={styles.button}
            isLoading={isLoading}
            darkMode={isDark}
          />

          <Link 
            href="/(auth)/login" 
            style={[styles.link, isDark && styles.linkDark]}
          >
            Already have an account? Login
          </Link>
        </View>
      </Animated.ScrollView>
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