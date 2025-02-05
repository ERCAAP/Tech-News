import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Animated, TouchableOpacity, Image, Platform, Text } from 'react-native';
import { useAppDispatch } from '@/redux/hooks';
import { login, register } from '@/redux/slices/authSlice';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Link, router } from 'expo-router';
import { COLORS, FONTS, shadowStyle } from '@/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Checkbox } from '@/components/common/Checkbox';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import { ResponseType } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { BaseRegisterData, SocialRegisterData } from '../../src/types/auth';
import { LinearGradient } from 'expo-linear-gradient';

// Initialize WebBrowser for Google Auth
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "525452151140-as53nb6dto2vs2b8q27rupd53o8a9ljh.apps.googleusercontent.com",
    iosClientId: "525452151140-hioo013keiekvusk0f83plm0qd5p2g90.apps.googleusercontent.com",
    responseType: ResponseType.Code,
    usePKCE: true,
    scopes: ['profile', 'email'],
    redirectUri: Platform.select({
      ios: 'com.ercaap55.technews:/oauth2redirect',
      android: 'com.ercaap55.technews:/oauth2redirect'
    }),
    state: Crypto.randomUUID()
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadCredentials = async () => {
      try {
        const savedRememberMe = await AsyncStorage.getItem('rememberMe');
        const savedEmail = await AsyncStorage.getItem('userEmail');
        const savedPassword = await AsyncStorage.getItem('userPassword');

        if (!isMounted) return;

        if (savedEmail && savedPassword) {
          setRememberMe(savedRememberMe === 'true');
          setFormData({
            email: savedEmail,
            password: savedPassword
          });
          
          // Eğer rememberMe true ise otomatik giriş yap
          if (savedRememberMe === 'true') {
            try {
              const result = await dispatch(login({ email: savedEmail, password: savedPassword })).unwrap();
              if (result) {
                router.replace('/(tabs)');
              }
            } catch (error) {
              console.log('Auto login failed, user needs to login manually');
            }
          }
        }
      } catch (error) {
        console.error('Error loading saved credentials:', error);
        if (isMounted) {
          setRememberMe(false);
          setFormData({ email: '', password: '' });
        }
      }
    };

    loadCredentials();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleAuthResponse(authentication?.accessToken);
    }
  }, [response]);

  const handleRememberMeChange = async (value: boolean) => {
    setRememberMe(value);
    await AsyncStorage.setItem('rememberMe', value ? 'true' : 'false');
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

  const handleGoogleAuthResponse = async (accessToken: string | undefined) => {
    if (!accessToken) return;

    try {
      setIsLoading(true);
      const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      const userInfo = await response.json();
      
      const googleUserData: SocialRegisterData = {
        email: userInfo.email,
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        password: '', 
        socialProvider: 'google',
        socialId: userInfo.id,
        picture: userInfo.picture,
        locale: userInfo.locale
      };

      await dispatch(register(googleUserData)).unwrap();
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Google Sign-In Error',
        error.message || 'Failed to sign in with Google'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await promptAsync();
      
      if (result?.type === 'success') {
        // Authorization code'u alıyoruz
        const { code } = result.params;
        
        // Backend'e code'u gönderip token alıyoruz
        const tokenResponse = await fetch('YOUR_BACKEND_URL/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            code,
            codeVerifier: request?.codeVerifier // PKCE code verifier
          })
        });

        if (!tokenResponse.ok) {
          throw new Error('Token exchange failed');
        }

        const tokens = await tokenResponse.json();
        
        // Token'ı güvenli şekilde saklıyoruz
        await SecureStore.setItemAsync('accessToken', tokens.accessToken);
        await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);

        // Kullanıcı bilgilerini alıyoruz
        const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: { 
            Authorization: `Bearer ${tokens.accessToken}`,
            Accept: 'application/json'
          },
        });

        if (!userInfoResponse.ok) {
          throw new Error('Failed to fetch user info');
        }

        const userInfo = await userInfoResponse.json();
        
        // Kullanıcıyı kaydet/giriş yap
        await dispatch(register({
          email: userInfo.email,
          firstName: userInfo.given_name,
          lastName: userInfo.family_name,
          socialProvider: 'google',
          socialId: userInfo.id,
          picture: userInfo.picture,
          password: '' // Add empty password for social login
        })).unwrap();

        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Error', 'Failed to sign in with Google');
    }
  };

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const appleUserData: SocialRegisterData = {
        email: credential.email || '',
        firstName: credential.fullName?.givenName || '',
        lastName: credential.fullName?.familyName || '',
        password: '',
        socialProvider: 'apple',
        socialId: credential.user
      };

      await dispatch(register(appleUserData)).unwrap();
      router.replace('/(tabs)');
    } catch (error: any) {
      if (error.code !== 'ERR_CANCELED') {
        Alert.alert('Apple Sign-In Error', error.message || 'Failed to sign in with Apple');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#f6f9fc', '#ecf1f7', '#e4ebf3']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View 
          style={[styles.content, {
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              })
            }]
          }]}
        >
          <View style={styles.formContainer}>
            <Input
              label="Email"
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail"
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
            />

            <View style={styles.rememberMeContainer}>
              <Checkbox
                checked={rememberMe}
                onPress={() => handleRememberMeChange(!rememberMe)}
                label="Remember Me"
              />
            </View>

            <Button
              title={isLoading ? "Logging in..." : "Login"}
              onPress={handleLogin}
              disabled={isLoading}
              style={styles.button}
              isLoading={isLoading}
            />

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity 
                style={styles.socialButton} 
                onPress={handleGoogleLogin}
                disabled={!request}
              >
                <FontAwesome name="google" size={20} color={COLORS.primary} />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              {Platform.OS === 'ios' && (
                <TouchableOpacity 
                  style={styles.socialButton} 
                  onPress={handleAppleLogin}
                >
                  <FontAwesome name="apple" size={20} color={COLORS.primary} />
                  <Text style={styles.socialButtonText}>Apple</Text>
                </TouchableOpacity>
              )}
            </View>

            <Link href="/(auth)/register">
              <Text style={styles.link}>
                Don't have an account? <Text style={styles.linkHighlight}>Register</Text>
              </Text>
            </Link>
          </View>
        </Animated.View>
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
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.08)',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
      },
      android: {
        elevation: 4,
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
  rememberMeContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  dividerText: {
    marginHorizontal: 16,
    color: COLORS.gray,
    fontSize: 14,
    fontFamily: FONTS.regular,
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
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    width: '48%',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.06)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  socialButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
  },
}); 