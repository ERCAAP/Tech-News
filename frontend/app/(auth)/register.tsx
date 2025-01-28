import { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, Text } from 'react-native';
import { useAppDispatch } from '@/redux/hooks';
import { setUser } from '@/redux/slices/authSlice';
import { router } from 'expo-router';
import React from 'react';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const handleRegister = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validations
      if (!username || username.length < 3) {
        throw new Error('Kullanıcı adı en az 3 karakter olmalıdır');
      }

      if (!email.includes('@')) {
        throw new Error('Geçerli bir email adresi giriniz');
      }

      if (password.length < 6) {
        throw new Error('Şifre en az 6 karakter olmalıdır');
      }

      if (password !== confirmPassword) {
        throw new Error('Şifreler eşleşmiyor');
      }

      // TODO: Implement actual API register logic here
      await new Promise(resolve => setTimeout(resolve, 1000));

      dispatch(setUser({
        id: '1',
        username,
        email,
      }));

      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt olurken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kayıt Ol</Text>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Kullanıcı Adı"
        value={username}
        onChangeText={setUsername}
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        placeholder="Şifre Tekrar"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        editable={!isLoading}
      />

      <Pressable 
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
        </Text>
      </Pressable>

      <Pressable 
        style={styles.loginButton}
        onPress={() => router.back()}
        disabled={isLoading}
      >
        <Text style={styles.loginText}>Zaten hesabınız var mı? Giriş yapın</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginText: {
    color: '#007AFF',
    fontSize: 16,
  },
  errorText: {
    color: '#ff3b30',
    marginBottom: 16,
    textAlign: 'center',
  },
}); 