import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Animated, TouchableOpacity, Image, Platform, Text } from 'react-native';
import { useAppDispatch } from '@/redux/hooks';
import { login } from '@/redux/slices/authSlice';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Link, router } from 'expo-router';
import { COLORS, FONTS, shadowStyle } from '@/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Checkbox } from '@/components/common/Checkbox';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(
    (systemColorScheme as 'light' | 'dark') ?? 'light'
  );
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadThemePreference();
    loadSavedCredentials();
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

  const autoLogin = async (email: string, password: string) => {
    try {
      const result = await dispatch(login({ email, password })).unwrap();
      if (result) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.log('Auto login failed, user needs to login manually');
    }
  };

  const loadSavedCredentials = async () => {
    try {
      const savedRememberMe = await AsyncStorage.getItem('rememberMe');
      const savedEmail = await AsyncStorage.getItem('userEmail');
      const savedPassword = await AsyncStorage.getItem('userPassword');

      if (savedRememberMe === 'true' && savedEmail && savedPassword) {
        setRememberMe(true);
        setFormData(prev => ({
          ...prev,
          email: savedEmail,
          password: savedPassword
        }));
        
        await autoLogin(savedEmail, savedPassword);
      } else {
        setRememberMe(false);
        setFormData({ email: '', password: '' });
      }
    } catch (error) {
      console.error('Error loading saved credentials:', error);
      setRememberMe(false);
      setFormData({ email: '', password: '' });
    }
  };

  const handleRememberMeChange = async (value: boolean) => {
    setRememberMe(value);
    await AsyncStorage.setItem('rememberMe', value ? 'true' : 'false');
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
      
      if (rememberMe) {
        await AsyncStorage.setItem('userEmail', formData.email);
        await AsyncStorage.setItem('userPassword', formData.password);
      } else {
        await AsyncStorage.removeItem('userEmail');
        await AsyncStorage.removeItem('userPassword');
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

  const handleGoogleLogin = () => {
    Alert.alert('Info', 'Google login will be implemented soon');
  };

  const handleAppleLogin = () => {
    Alert.alert('Info', 'Apple login will be implemented soon');
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
            secureTextEntry={!showPassword}
            leftIcon="lock"
            rightIcon={showPassword ? "visibility" : "visibility-off"}
            onRightIconPress={() => setShowPassword(!showPassword)}
            darkMode={isDark}
          />

          <View style={styles.rememberMeContainer}>
            <Checkbox
              checked={rememberMe}
              onPress={() => handleRememberMeChange(!rememberMe)}
              label="Remember Me"
              darkMode={isDark}
            />
          </View>

          <Button
            title={isLoading ? "Logging in..." : "Login"}
            onPress={handleLogin}
            disabled={isLoading}
            style={styles.button}
            isLoading={isLoading}
            darkMode={isDark}
          />

          <View style={styles.dividerContainer}>
            <View style={[styles.divider, isDark && styles.dividerDark]} />
            <Text style={[styles.dividerText, isDark && styles.dividerTextDark]}>or continue with</Text>
            <View style={[styles.divider, isDark && styles.dividerDark]} />
          </View>

          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity 
              style={[styles.socialButton, isDark && styles.socialButtonDark]} 
              onPress={handleGoogleLogin}
            >
              <FontAwesome name="google" size={20} color={isDark ? COLORS.white : COLORS.dark} />
              <Text style={[styles.socialButtonText, isDark && styles.socialButtonTextDark]}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialButton, isDark && styles.socialButtonDark]} 
              onPress={handleAppleLogin}
            >
              <FontAwesome name="apple" size={20} color={isDark ? COLORS.white : COLORS.dark} />
              <Text style={[styles.socialButtonText, isDark && styles.socialButtonTextDark]}>Apple</Text>
            </TouchableOpacity>
          </View>

          <Link href="/(auth)/register">
            <Text style={[styles.link, isDark && styles.linkDark]}>
              Don't have an account? Register
            </Text>
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
  rememberMeContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray,
  },
  dividerDark: {
    backgroundColor: COLORS.darkSecondary,
  },
  dividerText: {
    marginHorizontal: 10,
    color: COLORS.gray,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  dividerTextDark: {
    color: COLORS.gray,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray,
    width: '48%',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  socialButtonDark: {
    backgroundColor: COLORS.darkSecondary,
    borderColor: COLORS.dark,
  },
  socialButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
  },
  socialButtonTextDark: {
    color: COLORS.white,
  },
}); 