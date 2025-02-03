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

export default function RegisterScreen() {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
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
      
      // Form validation
      if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
        Alert.alert('Error', 'All fields are required');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }

      // Password validation
      if (formData.password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return;
      }

      console.log('Submitting registration form:', formData);

      // Doğrudan axios instance'ı kullanarak register isteği
      const response = await axiosInstance.post('/auth/register', formData);
      console.log('Registration API response:', response.data);

      if (response.data.status === 'success') {
        const { user, token } = response.data.data;
        
        // Redux store'u güncelle
        await dispatch(register({ user, token })).unwrap();
        
        console.log('Registration successful:', user);
        router.replace('/(tabs)');
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error);
      Alert.alert(
        'Registration Error',
        error.response?.data?.message || error.message || 'Failed to register. Please try again.'
      );
    } finally {
      setIsLoading(false);
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
              title={isLoading ? "Creating Account..." : "Create Account"}
              onPress={handleRegister}
              disabled={isLoading}
              style={styles.button}
              isLoading={isLoading}
            />

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
}); 