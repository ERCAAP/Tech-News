import { useState } from 'react';
import { Alert, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '@/theme';

interface FormData {
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
}

interface NewsFormProps {
  initialData?: FormData;
  onSubmit: (data: FormData) => void;
}

export function NewsForm({ initialData, onSubmit }: NewsFormProps) {
  const [formData, setFormData] = useState<FormData>(initialData || {
    title: '',
    content: '',
    category: '',
  });

  const handleImagePick = async () => {
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

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleImagePick}>
        <Text>Pick Image</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
        <Text>Take Photo</Text>
      </TouchableOpacity>
      
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
}); 