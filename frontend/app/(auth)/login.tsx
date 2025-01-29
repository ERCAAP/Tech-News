import { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, Text, Image } from 'react-native';
import { useAppDispatch } from '@/redux/hooks';
import { login } from '@/redux/slices/authSlice';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const { t } = useTranslation('auth');

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const resultAction = await dispatch(login({ email, password }));
      if (login.fulfilled.match(resultAction)) {
        router.replace('/(tabs)');
      } else if (login.rejected.match(resultAction)) {
        throw new Error(resultAction.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş yapılırken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>{t('login.title')}</Text>
      </View>

      {error && (
        <Text style={styles.errorText}>
          {t(`login.errors.${error}`, { defaultValue: t('common:errors.general') })}
        </Text>
      )}

      <TextInput
        style={styles.input}
        placeholder={t('login.email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        placeholder={t('login.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />

      <Pressable 
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? t('login.loading') : t('login.submit')}
        </Text>
      </Pressable>

      <Pressable 
        style={styles.registerButton}
        onPress={() => router.push('/(auth)/register')}
        disabled={isLoading}
      >
        <Text style={styles.registerText}>{t('login.register_link')}</Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
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
  registerButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  registerText: {
    color: '#007AFF',
    fontSize: 16,
  },
  errorText: {
    color: '#ff3b30',
    marginBottom: 16,
    textAlign: 'center',
  },
}); 