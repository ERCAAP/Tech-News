import React, { useState } from 'react';
import { View, StyleSheet, Alert, Animated, Text, Platform } from 'react-native';
import { useAppDispatch } from '@/redux/hooks';
import { register } from '@/redux/slices/authSlice';
import axiosInstance from '@/api/axios';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Link, router } from 'expo-router';
import { COLORS, FONTS } from '@/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';

interface ApiResponse {
  data: {
    user: {
      _id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      favoriteNews: string[];
    };
    message?: string;
    token: string;
  };
  status: number;
}

export default function RegisterScreen() {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
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
    setIsLoading(true);
    setStatus('loading');
    
    // Form validation
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setStatus('error');
      Alert.alert('Error', 'All fields are required');
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatus('error');
      Alert.alert('Error', 'Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    // Password validation
    if (formData.password.length < 6) {
      setStatus('error');
      Alert.alert('Error', 'Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post<ApiResponse>('/auth/register', formData);
      console.log('API Response:', response.data);

      if (response.status === 201 || response.status === 200) {
        const user = response.data.user;
        const token = response.data.token;

        if (!user || !token) {
          setStatus('error');
          Alert.alert('Registration Failed', 'Invalid response from server');
          setIsLoading(false);
          return;
        }

        // Token'ı AsyncStorage'a kaydedelim
        await AsyncStorage.setItem('token', token);

        await dispatch(register({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          password: formData.password
        })).unwrap();

        setStatus('success');
        setIsLoading(false);
        
        Alert.alert(
          'Success! 🎉',
          'Your account has been created successfully!',
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/(tabs)')
            }
          ]
        );
      } else {
        setStatus('error');
        Alert.alert(
          'Registration Failed',
          response.data.message || 'Registration failed. Please try again.'
        );
        setIsLoading(false);
      }
    } catch (error: any) {
      setStatus('error');
      setIsLoading(false);

      const errorMessage = error.response?.data?.message || 
                          'A network error occurred. Please check your connection and try again.';
      
      Alert.alert(
        'Registration Failed',
        errorMessage
      );
    }
  };

  const getButtonStyle = () => {
    switch (status) {
      case 'success':
        return [styles.button, styles.successButton];
      case 'error':
        return [styles.button, styles.errorButton];
      default:
        return styles.button;
    }
  };

  const getButtonTitle = () => {
    switch (status) {
      case 'loading':
        return "Creating Account...";
      case 'success':
        return "Account Created!";
      case 'error':
        return "Try Again";
      default:
        return "Create Account";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#f6f9fc', '#ecf1f7', '#e4ebf3']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.ScrollView 
          style={[styles.content, {
            opacity: slideAnim,
            transform: [{
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              })
            }]
          }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <Input
              label="First Name"
              value={formData.firstName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
              placeholder="Enter your first name"
              leftIcon="person"
            />

            <Input
              label="Last Name"
              value={formData.lastName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
              placeholder="Enter your last name"
              leftIcon="person"
            />

            <Input
              label="Email"
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="email"
            />

            <Input
              label="Password"
              value={formData.password}
              onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
              placeholder="Enter your password"
              secureTextEntry
              leftIcon="lock"
            />

            <Button
              title={getButtonTitle()}
              onPress={handleRegister}
              disabled={isLoading}
              style={getButtonStyle()}
              isLoading={isLoading}
              icon={status === 'success' ? 'check-circle' : undefined}
            />

            {status === 'error' && (
              <Text style={styles.errorText}>
                Please check your information and try again
              </Text>
            )}

            <Link href="/(auth)/login">
              <Text style={styles.link}>
                Already have an account? <Text style={styles.linkHighlight}>Login</Text>
              </Text>
            </Link>
          </View>
        </Animated.ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  button: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 56,
  },
  link: {
    marginTop: 16,
    textAlign: 'center',
    color: COLORS.gray,
    fontFamily: FONTS.regular,
    fontSize: 15,
  },
  linkHighlight: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
  },
  successButton: {
    backgroundColor: COLORS.success,
  },
  errorButton: {
    backgroundColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
}); 