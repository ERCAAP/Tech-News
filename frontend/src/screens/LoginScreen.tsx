import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { login } from '../redux/slices/authSlice';
import { AppDispatch } from '../redux/store';
import { COLORS } from '@/theme';

const LoginScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      // Form validation
      if (!email || !password) {
        Alert.alert('Hata', 'Email ve şifre alanları zorunludur');
        return;
      }

      // Boşlukları temizleyelim
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();

      // Login isteği
      const result = await dispatch(login({
        email: trimmedEmail,
        password: trimmedPassword
      })).unwrap();

      if (result) {
        // Başarılı login sonrası
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      Alert.alert(
        'Giriş Başarısız',
        error.message || 'Giriş yapılırken bir hata oluştu'
      );
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity 
        style={styles.button}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>Giriş Yap</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center' as const,
    padding: 20,
    backgroundColor: COLORS.white,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: COLORS.white,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen; 