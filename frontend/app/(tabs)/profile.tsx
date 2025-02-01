import React, { useState } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity, Alert, ScrollView, ToastAndroid, Modal, TextInput } from 'react-native';
import { useAppDispatch } from '@/redux/hooks';
import { COLORS, FONTS, shadowStyle } from '@/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updateUserProfile } from '@/redux/slices/authSlice';
import { useAuth } from '@/contexts/AuthContext';
import { getUserInitials } from '@/utils/userHelpers';
import { User } from '@/types';

const menuItems = [
  { icon: 'edit', label: 'Edit Profile', action: 'edit' },
  { icon: 'star', label: 'Rate Us', action: 'rate' },
  { icon: 'description', label: 'Terms of Use', action: 'terms' },
  { icon: 'privacy-tip', label: 'Privacy Policy', action: 'privacy' },
  { icon: 'subscriptions', label: 'Manage Subscriptions', action: 'subscriptions' },
  { icon: 'cancel', label: 'Cancel Subscription', action: 'cancel' },
  { icon: 'restore', label: 'Restore Purchases', action: 'restore' },
] as const;

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
  });

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

  const handleMenuPress = (action: typeof menuItems[number]['action']) => {
    switch (action) {
      case 'edit':
        handleEditPress();
        break;
      case 'rate':
        Alert.alert('Coming Soon', 'This feature will be available soon!');
        break;
      case 'terms':
        router.push('/terms');
        break;
      case 'privacy':
        router.push('/privacy');
        break;
      default:
        Alert.alert('Coming Soon', 'This feature will be available soon!');
    }
  };

  const handleEditPress = () => {
    if (user) {
      setEditForm({
        firstName: user.firstName,
        lastName: user.lastName,
      });
      setIsEditModalVisible(true);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);
      
      // Sadece değişen alanları gönder
      const updateData: Partial<User> = {};
      if (editForm.firstName !== user?.firstName) {
        updateData.firstName = editForm.firstName;
      }
      if (editForm.lastName !== user?.lastName) {
        updateData.lastName = editForm.lastName;
      }

      // Eğer hiçbir değişiklik yoksa güncelleme yapma
      if (Object.keys(updateData).length === 0) {
        setIsEditModalVisible(false);
        return;
      }

      // Mevcut kullanıcı bilgileriyle birleştir
      const updatedUser = {
        ...user!,
        ...updateData
      };

      await dispatch(updateUserProfile(updatedUser)).unwrap();
      ToastAndroid.show('Profil başarıyla güncellendi', ToastAndroid.SHORT);
      setIsEditModalVisible(false);
      
    } catch (error: any) {
      console.error('Profile update error:', error);
      Alert.alert(
        'Hata',
        error.message || 'Profil güncellenirken bir hata oluştu'
      );
    } finally {
      setIsLoading(false);
    }
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

  // Edit Modal Component
  const EditProfileModal = () => (
    <Modal
      visible={isEditModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setIsEditModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Profili Düzenle</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Ad</Text>
            <TextInput
              style={styles.input}
              value={editForm.firstName}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, firstName: text }))}
              placeholder="Adınız"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Soyad</Text>
            <TextInput
              style={styles.input}
              value={editForm.lastName}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, lastName: text }))}
              placeholder="Soyadınız"
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setIsEditModalVisible(false)}
            >
              <Text style={styles.buttonText}>İptal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleUpdateProfile}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <EditProfileModal />
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
              onPress={() => handleMenuPress(item.action)}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    ...shadowStyle,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: COLORS.gray + '20',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
}); 