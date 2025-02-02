import React, { useState } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity, Alert, ScrollView, ToastAndroid, Modal, TextInput, Platform, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { COLORS, FONTS, shadowStyle } from '@/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updateUserProfile, logout } from '@/redux/slices/authSlice';
import { getUserInitials } from '@/utils/userHelpers';
import { User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppDispatch } from '@/redux/store';

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
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
  });

  const handleImagePick = async () => {
    try {
      // İzinleri kontrol et
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          "İzin Gerekli",
          "Fotoğraf seçmek için galeri iznine ihtiyacımız var.",
          [{ text: "Tamam" }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0] && user) {
        setIsLoading(true);
        
        try {
          const imageUri = result.assets[0].uri;
          
          // Önce resmi base64'e çevir
          const response = await fetch(imageUri);
          const blob = await response.blob();
          const reader = new FileReader();
          
          reader.onload = async () => {
            try {
              const base64data = reader.result?.toString().split(',')[1];
              
              const updatedUser = {
                ...user,
                avatar: `data:image/jpeg;base64,${base64data}`
              };

              await dispatch(updateUserProfile(updatedUser)).unwrap();
              ToastAndroid.show('Profil fotoğrafı güncellendi', ToastAndroid.SHORT);
            } catch (error) {
              console.error('Base64 conversion error:', error);
              Alert.alert(
                'Hata',
                'Fotoğraf yüklenirken bir hata oluştu'
              );
            } finally {
              setIsLoading(false);
            }
          };

          reader.onerror = () => {
            setIsLoading(false);
            Alert.alert(
              'Hata',
              'Fotoğraf okunamadı'
            );
          };

          reader.readAsDataURL(blob);
        } catch (error: any) {
          console.error('Profile photo update error:', error);
          Alert.alert(
            'Hata',
            error.message || 'Profil fotoğrafı güncellenirken bir hata oluştu'
          );
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert(
        'Hata',
        'Fotoğraf seçilirken bir hata oluştu. Lütfen tekrar deneyin.'
      );
      setIsLoading(false);
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
    if (user && !isEditModalVisible) {
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
      
      const updateData: Partial<User> = {};
      if (editForm.firstName !== user?.firstName) {
        updateData.firstName = editForm.firstName;
      }
      if (editForm.lastName !== user?.lastName) {
        updateData.lastName = editForm.lastName;
      }

      if (Object.keys(updateData).length === 0) {
        setIsEditModalVisible(false);
        return;
      }

      const updatedUser = {
        ...user!,
        ...updateData
      };

      await dispatch(updateUserProfile(updatedUser));
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

  const handleLogout = async () => {
    Alert.alert(
      "Çıkış Yap",
      "Çıkış yapmak istediğinize emin misiniz?",
      [
        {
          text: "İptal",
          style: "cancel"
        },
        {
          text: "Çıkış Yap",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userEmail');
            await AsyncStorage.removeItem('userPassword');
            await AsyncStorage.removeItem('rememberMe');
            dispatch(logout());
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const renderAvatar = () => {
    if (!user) return null;

    return (
      <View style={styles.avatarWrapper}>
        {user.avatar ? (
          <Image
            source={{ uri: user.avatar }}
            style={styles.avatar}
            resizeMode="cover"
            onError={() => {
              console.error('Avatar yükleme hatası');
              // Hata durumunda placeholder göster
              Alert.alert(
                'Hata',
                'Profil fotoğrafı yüklenemedi'
              );
            }}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>
              {getUserInitials(user)}
            </Text>
          </View>
        )}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={COLORS.white} />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Üst profil bölümü */}
        <View style={styles.headerSection}>
          <View style={styles.profileHeader}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={handleImagePick}
              disabled={isLoading}
            >
              {renderAvatar()}
            </TouchableOpacity>
            
            <View style={styles.userInfo}>
              <View style={styles.nameContainer}>
                <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
                <TouchableOpacity 
                  style={styles.editProfileButton} 
                  onPress={handleEditPress}
                >
                  <MaterialIcons name="edit" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.email}>{user?.email}</Text>
              {user?.role === 'admin' && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminText}>Admin</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Menu Items - Edit Profile'ı menüden kaldır */}
        <View style={styles.menuContainer}>
          {menuItems
            .filter(item => item.action !== 'edit')
            .map((item, index, filteredArray) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.menuItem,
                  index !== filteredArray.length - 1 && styles.menuItemBorder
                ]}
                onPress={() => handleMenuPress(item.action)}
              >
                <View style={styles.menuIconContainer}>
                  <MaterialIcons name={item.icon as any} size={22} color={COLORS.gray} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <MaterialIcons name="chevron-right" size={22} color={COLORS.gray} />
              </TouchableOpacity>
            ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={22} color={COLORS.white} />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal'ı ScrollView dışına taşı */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="fade"
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    backgroundColor: COLORS.white,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: COLORS.background,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 28,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  userInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
  },
  email: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: 4,
  },
  adminBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  adminText: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    fontSize: 12,
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    ...shadowStyle,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
  },
  logoutButton: {
    backgroundColor: COLORS.danger,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 30,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: 15,
    fontFamily: FONTS.medium,
    marginLeft: 8,
  },
  editProfileButton: {
    marginLeft: 8,
    padding: 4,
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
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 