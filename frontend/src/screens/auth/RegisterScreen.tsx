import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useAppDispatch } from '@/redux/hooks';
import { register } from '@/redux/slices/authSlice';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { COLORS } from '@/theme';
import { router } from 'expo-router';

export default function RegisterScreen() {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      setIsLoading(true);
      await dispatch(register(formData)).unwrap();
      Alert.alert('Success', 'Registration successful', [
        {
          text: 'OK',
          onPress: () => router.replace('/(auth)/login')
        }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        label="First Name"
        value={formData.firstName}
        onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
        placeholder="Enter your first name"
        autoCapitalize="words"
      />

      <Input
        label="Last Name"
        value={formData.lastName}
        onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
        placeholder="Enter your last name"
        autoCapitalize="words"
      />

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
        title={isLoading ? "Creating Account..." : "Create Account"}
        onPress={handleRegister}
        disabled={isLoading}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  button: {
    marginTop: 24,
  },
}); 