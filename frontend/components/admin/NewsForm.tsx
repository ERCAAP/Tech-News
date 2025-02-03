import { useState } from 'react';
import { Alert, View, TouchableOpacity, Text, StyleSheet, Linking, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONTS, shadowStyle } from '@/theme';
import { Switch } from '../common/Switch';
import { Input } from '../common/Input';

interface FormData {
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  notification: {
    enabled: boolean;
    title: string;
    message: string;
  };
}

interface NewsFormProps {
  initialData?: FormData;
  onSubmit: (data: FormData) => void;
}

export function NewsForm({ initialData, onSubmit }: NewsFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    category: initialData?.category || '',
    imageUrl: initialData?.imageUrl,
    notification: {
      enabled: initialData?.notification?.enabled || false,
      title: initialData?.notification?.title || '',
      message: initialData?.notification?.message || ''
    }
  });

  const handleImagePick = async () => {
    if (formData.imageUrl?.startsWith('http')) {
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormData((prev: FormData) => ({
          ...prev,
          imageUrl: result.assets[0].uri
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleTakePhoto = async () => {
    if (formData.imageUrl?.startsWith('http')) {
      return;
    }

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Error', 'Camera permission is required');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormData((prev: FormData) => ({
          ...prev,
          imageUrl: result.assets[0].uri
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.content || !formData.category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    onSubmit(formData);
  };

  const handleImagePress = () => {
    if (formData.imageUrl?.startsWith('http')) {
      Linking.openURL(formData.imageUrl);
    }
  };

  const updateNotification = (updates: Partial<FormData['notification']>) => {
    setFormData(prev => ({
      ...prev,
      notification: {
        ...prev.notification,
        ...updates
      }
    }));
  };

  return (
    <View style={styles.container}>
      {formData.imageUrl && (
        <TouchableOpacity onPress={handleImagePress}>
          <Image
            source={{ uri: formData.imageUrl }}
            style={styles.newsImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}
      
      <TouchableOpacity style={styles.button} onPress={handleImagePick}>
        <Text>Pick Image</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
        <Text>Take Photo</Text>
      </TouchableOpacity>
      
      <View style={styles.notificationSection}>
        <Text style={styles.sectionTitle}>Push Notification</Text>
        
        <View style={styles.notificationRow}>
          <Text style={styles.label}>Send Notification</Text>
          <Switch
            value={formData.notification.enabled}
            onValueChange={(value) => updateNotification({ enabled: value })}
          />
        </View>

        {formData.notification.enabled && (
          <View style={styles.notificationForm}>
            <Input
              label="Notification Title"
              value={formData.notification.title}
              onChangeText={(text) => updateNotification({ title: text })}
              placeholder="Enter notification title"
              maxLength={50}
            />

            <Input
              label="Notification Message"
              value={formData.notification.message}
              onChangeText={(text) => updateNotification({ message: text })}
              placeholder="Enter notification message"
              maxLength={100}
              multiline
            />
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  button: {
    padding: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  submitButton: {
    padding: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  newsImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  notificationSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    ...shadowStyle,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    marginBottom: 16,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  notificationForm: {
    marginTop: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
  },
}); 