import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { COLORS } from '@/theme';
import { Header } from '@/components/common/Header';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { logout } from '@/redux/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditProfileScreen() {
  const { user } = useAppSelector(state => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement profile update logic
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        // TODO: Implement avatar update logic
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await AsyncStorage.removeItem('token');
      dispatch(logout());
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Edit Profile" showBack />
      <View style={styles.content}>
        <Input
          label="First Name"
          value={formData.firstName}
          onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
          placeholder="Enter your first name"
        />
        <Input
          label="Last Name"
          value={formData.lastName}
          onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
          placeholder="Enter your last name"
        />
        <Input
          label="Email"
          value={formData.email}
          onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Button
          title="Change Profile Picture"
          onPress={handlePickImage}
          style={styles.button}
          variant="outline"
        />
        <Button
          title={isLoading ? "Updating..." : "Update Profile"}
          onPress={handleUpdateProfile}
          disabled={isLoading}
          style={styles.button}
          isLoading={isLoading}
        />
        <Button
          title="Logout"
          onPress={handleLogout}
          loading={isLoading}
          variant="secondary"
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  button: {
    marginTop: 16,
  },
}); 