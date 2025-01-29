import { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, Text } from 'react-native';
import { useAppDispatch } from '@/redux/hooks';
import { register } from '@/redux/slices/authSlice';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import React from 'react';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleRegister = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const resultAction = await dispatch(register({
        email,
        password,
        firstName,
        lastName
      }));

      if (register.fulfilled.match(resultAction)) {
        router.replace('/(tabs)');
      } else if (register.rejected.match(resultAction)) {
        throw new Error(resultAction.error.message);
      }
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

      <TextInput
        style={styles.input}
        placeholder="Adı"
        value={firstName}
        onChangeText={setFirstName}
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        placeholder="Soyadı"
        value={lastName}
        onChangeText={setLastName}
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