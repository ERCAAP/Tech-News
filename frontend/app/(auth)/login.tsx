import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useAppDispatch } from '@/redux/hooks';
import { login } from '@/redux/slices/authSlice';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Link, router } from 'expo-router';
import { COLORS } from '@/theme';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      if (!formData.email || !formData.password) {
        Alert.alert('Hata', 'Lütfen email ve şifrenizi giriniz');
        return;
      }
      
      console.log('Login attempt with:', formData);
      
      const result = await dispatch(login(formData)).unwrap();
      console.log('Login success:', result);
      
      // Login başarılı olduğunda ana sayfaya yönlendir
      router.replace('/(tabs)');
      
    } catch (error: any) {
      console.log('Login Error:', error);
      Alert.alert(
        'Giriş Hatası',
        error.message || 'Giriş yapılırken bir hata oluştu. Lütfen bilgilerinizi kontrol edin.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        label="Email"
        value={formData.email}
        onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Input
        label="Password"
        value={formData.password}
        onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
        placeholder="Enter your password"
        secureTextEntry
      />

      <Button
        title={isLoading ? "Logging in..." : "Login"}
        onPress={handleLogin}
        disabled={isLoading}
        style={styles.button}
      />

      <Link href="/(auth)/register" style={styles.link}>
        Don't have an account? Register
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
  },
  button: {
    marginTop: 24,
  },
  link: {
    marginTop: 16,
    textAlign: 'center',
    color: COLORS.primary,
  },
}); 