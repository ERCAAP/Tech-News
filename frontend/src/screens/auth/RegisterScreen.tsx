import { useState } from 'react';
import { View, Alert } from 'react-native';
import { useAppDispatch } from '@/redux/hooks';
import { register } from '@/redux/slices/authSlice';

export default function RegisterScreen() {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (values: any) => {
    try {
      setIsLoading(true);
      await dispatch(register(values)).unwrap();
      // Başarılı kayıt
    } catch (error: any) {
      Alert.alert(
        'Kayıt Hatası',
        error.response?.data?.message || 'Kayıt işlemi sırasında bir hata oluştu'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ... diğer kodlar
} 