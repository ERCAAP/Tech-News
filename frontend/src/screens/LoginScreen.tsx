import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { login } from '../redux/slices/authSlice';

const LoginScreen = () => {
  const dispatch = useDispatch();
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
      await dispatch(login({
        email: trimmedEmail,
        password: trimmedPassword
      })).unwrap();

      // Başarılı login sonrası
      router.replace('/(tabs)');
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
      {/* Form inputs and buttons */}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
};

export default LoginScreen; 