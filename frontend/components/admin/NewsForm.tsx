import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync } from 'expo-image-manipulator';

const handleImagePick = async () => {
  try {
    // İzinleri kontrol et
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photos');
      return;
    }

    // Resim seçme
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      // Seçilen resmi işle
      const manipResult = await manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.8, format: 'jpeg' }
      );

      setFormData(prev => ({
        ...prev,
        imageUrl: manipResult.uri
      }));
    }
  } catch (error) {
    console.error('Image pick error:', error);
    Alert.alert('Error', 'Failed to pick image. Please try again.');
  }
};

// Kamera ile fotoğraf çekme
const handleTakePhoto = async () => {
  try {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      const manipResult = await manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.8, format: 'jpeg' }
      );

      setFormData(prev => ({
        ...prev,
        imageUrl: manipResult.uri
      }));
    }
  } catch (error) {
    console.error('Camera error:', error);
    Alert.alert('Error', 'Failed to take photo. Please try again.');
  }
}; 