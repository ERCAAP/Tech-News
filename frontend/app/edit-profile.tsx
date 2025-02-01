import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { COLORS, FONTS, shadowStyle } from '@/theme';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { router } from 'expo-router';
import { logout, updateUserProfile } from '@/redux/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

export default function EditProfileScreen() {
  const { user } = useAppSelector(state => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/profile');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      if (!user) {
        console.error('No user found in state');
        return;
      }
      
      setIsLoading(true);
      
      // Validate inputs
      if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
        Alert.alert('Error', 'All fields are required');
        return;
      }

      console.log('Updating profile with data:', {
        ...user,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
      });

      const result = await dispatch(updateUserProfile({
        ...user,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
      })).unwrap();

      console.log('Profile update result:', result);

      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error: any) {
      console.error('Profile update error:', error);
      Alert.alert(
        'Error', 
        error.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      dispatch(logout());
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

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
          title={isLoading ? "Updating..." : "Update Profile"}
          onPress={handleUpdateProfile}
          disabled={isLoading}
          style={styles.updateButton}
        />

        <Button
          title="Logout"
          onPress={handleLogout}
          variant="secondary"
          style={styles.logoutButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    ...shadowStyle,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    marginLeft: 8,
  },
  content: {
    padding: 16,
  },
  updateButton: {
    marginTop: 24,
  },
  logoutButton: {
    marginTop: 16,
    backgroundColor: COLORS.error,
  },
}); 