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

interface RegisterResponse {
  status: string;
  data: {
    user: {
      _id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      favoriteNews: string[];
    };
  };
  token: string;
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
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 12,
      bounciness: 8,
    });
    
    animation.start();

    return () => animation.stop();
  }, []);

  const handleRegister = async () => {
    try {
      setIsLoading(true);

      const response = await axiosInstance.post<RegisterResponse>('/auth/register', {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      console.log('Register Response:', response.data);

      if (response.data.status === 'success' && response.data.data?.user) {
        // Token'ı kaydet
        await AsyncStorage.setItem('token', response.data.token);
        
        // Redux store'u güncelle
        dispatch(register({
          user: response.data.data.user,
          token: response.data.token
        }));

        // Ana sayfaya yönlendir
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Registration failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Register Error:', error);
      Alert.alert(
        'Registration Failed',
        error.response?.data?.message || 'An error occurred during registration'
      );
    } finally {
      setIsLoading(false);
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