import React from 'react';
import { View, Text, Image, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { User, getUserFullName, getUserInitials, isUserAdmin } from '@/types';
import { Button } from '@/components/common/Button';
import { useAppDispatch } from '@/redux/hooks';
import { logout } from '@/redux/slices/authSlice';
import { router } from 'expo-router';
import { COLORS, FONTS } from '@/theme';
import { useResponsive } from '@/hooks/useResponsive';

interface ProfileInfoProps {
  user: User | null;
}

export function ProfileInfo({ user }: ProfileInfoProps) {
  const dispatch = useAppDispatch();
  const { wp, hp } = useResponsive();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            router.replace('/(auth)/login');
          },
        },
      ],
    );
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
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
      </View>

      <View style={styles.infoSection}>
        {isUserAdmin(user) && (
          <View style={styles.adminBadgeContainer}>
            <Text style={styles.adminBadge}>Admin</Text>
          </View>
        )}
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Member since</Text>
          <Text style={styles.infoValue}>
            {new Date(user.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="Edit Profile"
          variant="outline"
          style={styles.button}
          onPress={() => {/* TODO: Implement edit profile */}}
        />
        <Button
          title="Logout"
          variant="secondary"
          style={styles.button}
          onPress={handleLogout}
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
  },
  infoSection: {
    padding: 16,
    backgroundColor: COLORS.white,
    marginTop: 16,
  },
  adminBadgeContainer: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  adminBadge: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
  },
  actions: {
    padding: 16,
    marginTop: 'auto',
  },
  button: {
    marginVertical: 8,
  },
}); 