import React, { useState } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useAppDispatch } from '@/redux/hooks';
import { COLORS, FONTS, shadowStyle } from '@/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updateUserProfile } from '@/redux/slices/authSlice';
import { useAuth } from '@/contexts/AuthContext';
import { getUserInitials } from '@/utils/userHelpers';

const menuItems = [
  { icon: 'edit', label: 'Edit Profile', route: '/edit-profile' as const },
  { icon: 'star', label: 'Rate Us', route: '/feedback' as const },
  { icon: 'description', label: 'Terms of Use', route: '/terms' as const },
  { icon: 'privacy-tip', label: 'Privacy Policy', route: '/privacy' as const },
  { icon: 'subscriptions', label: 'Manage Subscriptions', route: '/edit-profile' as const },
  { icon: 'cancel', label: 'Cancel Subscription', route: '/edit-profile' as const },
  { icon: 'restore', label: 'Restore Purchases', route: '/edit-profile' as const },
] as const;

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && user) {
        setIsLoading(true);
        try {
          const updatedUser = {
            ...user,
            avatar: result.assets[0].uri
          };
          await dispatch(updateUserProfile(updatedUser)).unwrap();
          Alert.alert('Success', 'Profile photo updated successfully');
        } catch (error) {
          Alert.alert('Error', 'Failed to update profile photo');
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleMenuPress = (route: typeof menuItems[number]['route']) => {
    if (route === '/feedback') {
      Alert.alert('Coming Soon', 'This feature will be available soon!');
      return;
    }
    router.push(route);
  };

  const renderAvatar = () => {
    if (!user) return null;

    if (user.avatar) {
      return (
        <Image
          source={{ uri: user.avatar }}
          style={styles.avatar}
          resizeMode="cover"
        />
      );
    }

    return (
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarInitials}>
          {getUserInitials(user)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={handleImagePick}
            disabled={isLoading}
          >
            {renderAvatar()}
          </TouchableOpacity>

          <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.role === 'admin' && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminText}>Admin</Text>
            </View>
          )}
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                index !== menuItems.length - 1 && styles.menuItemBorder
              ]}
              onPress={() => handleMenuPress(item.route)}
            >
              <View style={styles.menuIconContainer}>
                <MaterialIcons name={item.icon as any} size={24} color={COLORS.gray} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <MaterialIcons name="chevron-right" size={24} color={COLORS.gray} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 36,
    color: '#666',
  },
  name: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: 8,
  },
  adminBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminText: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    marginTop: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    ...shadowStyle,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
  },
  scrollView: {
    flex: 1,
    marginBottom: 80, // Bottom bar için alan bırak
  },
  scrollContent: {
    paddingBottom: 16,
  },
}); 