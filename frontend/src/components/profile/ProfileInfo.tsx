import React from 'react';
import { View, Text, Image, StyleSheet, Alert, SafeAreaView, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { User, getUserFullName, getUserInitials, isUserAdmin } from '@/types';
import { Button } from '@/components/common/Button';
import { useAppDispatch } from '@/redux/hooks';
import { logout } from '@/redux/slices/authSlice';
import { router } from 'expo-router';
import { COLORS, FONTS, shadowStyle } from '@/theme';
import { useResponsive } from '@/hooks/useResponsive';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import * as StoreReview from 'expo-store-review';

interface ProfileInfoProps {
  user: User | null;
}

interface SettingItem {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
}

export function ProfileInfo({ user }: ProfileInfoProps) {
  const dispatch = useAppDispatch();
  const { wp, hp } = useResponsive();

  const settings: SettingItem[] = [
    {
      icon: 'edit',
      label: 'Edit Profile',
      onPress: () => router.push('/edit-profile')
    },
    {
      icon: 'star',
      label: 'Rate Us',
      onPress: () => {
        try {
          const storeUrl = Platform.select({
            ios: 'https://apps.apple.com/app/your-app-id',
            android: 'market://details?id=com.ercaap55.technews',
            default: '',
          });
          
          if (storeUrl) {
            Linking.openURL(storeUrl).catch(() => {
              Alert.alert('Error', 'Could not open store page');
            });
          }
        } catch (error) {
          console.error('Error opening store:', error);
          Alert.alert('Error', 'Could not open store page');
        }
      }
    },
    {
      icon: 'description',
      label: 'Terms of Use',
      onPress: () => router.push('/terms')
    },
    {
      icon: 'privacy-tip',
      label: 'Privacy Policy',
      onPress: () => router.push('/privacy')
    },
    {
      icon: 'subscriptions',
      label: 'Manage Subscriptions',
      onPress: () => Linking.openURL('https://play.google.com/store/account/subscriptions')
    },
    {
      icon: 'cancel',
      label: 'Cancel Subscription',
      onPress: () => Alert.alert(
        'Cancel Subscription',
        'Are you sure you want to cancel your subscription?',
        [
          { text: 'No', style: 'cancel' },
          { 
            text: 'Yes', 
            style: 'destructive',
            onPress: () => {/* TODO: Implement subscription cancellation */}
          }
        ]
      )
    },
    {
      icon: 'restore',
      label: 'Restore Purchases',
      onPress: () => {/* TODO: Implement purchase restoration */}
    },
    {
      icon: 'logout',
      label: 'Logout',
      onPress: handleLogout
    }
  ];

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.setItem('rememberMe', 'false');
              await AsyncStorage.removeItem('userEmail');
              await AsyncStorage.removeItem('userPassword');
              dispatch(logout());
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Error during logout:', error);
            }
          },
        },
      ],
    );
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          {user.avatar ? (
            <Image 
              source={{ uri: user.avatar }} 
              style={[styles.avatar, { width: wp('30%'), height: wp('30%') }]}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { width: wp('30%'), height: wp('30%') }]}>
              <Text style={styles.avatarText}>{getUserInitials(user)}</Text>
            </View>
          )}
          <Text style={styles.name}>{getUserFullName(user)}</Text>
          <Text style={styles.email}>{user.email}</Text>
          
          {isUserAdmin(user) && (
            <View style={styles.adminBadgeContainer}>
              <Text style={styles.adminBadge}>Admin</Text>
            </View>
          )}
        </View>

        <View style={styles.settingsContainer}>
          {settings.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.settingItem,
                index === settings.length - 1 && styles.lastSettingItem
              ]}
              onPress={item.onPress}
            >
              <View style={styles.settingContent}>
                <MaterialIcons 
                  name={item.icon} 
                  size={24} 
                  color={item.label === 'Logout' ? COLORS.danger : COLORS.dark} 
                />
                <Text style={[
                  styles.settingLabel,
                  item.label === 'Logout' && styles.logoutText
                ]}>
                  {item.label}
                </Text>
              </View>
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
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.primary,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 40,
    fontFamily: FONTS.bold,
  },
  name: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: 16,
  },
  adminBadgeContainer: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  adminBadge: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
  settingsContainer: {
    backgroundColor: COLORS.white,
    marginTop: 16,
    marginBottom: 100, // Bottom bar için extra padding
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    marginLeft: 16,
  },
  logoutText: {
    color: COLORS.danger,
  },
}); 