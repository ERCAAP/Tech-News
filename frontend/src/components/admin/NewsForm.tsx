import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useAppDispatch } from '@/redux/hooks';
import { createNews } from '@/redux/slices/newsSlice';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '@/theme';

export function NewsForm() {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    imageUrl: '',
  });

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData(prev => ({ ...prev, imageUrl: result.assets[0].uri }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content || !formData.category) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const form = new FormData();
      form.append('title', formData.title);
      form.append('content', formData.content);
      form.append('category', formData.category);
      
      if (formData.imageUrl) {
        const imageUri = formData.imageUrl;
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : 'image';
        
        form.append('image', {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }

      await dispatch(createNews(form)).unwrap();
      Alert.alert('Success', 'News created successfully');
      setFormData({ title: '', content: '', category: '', imageUrl: '' });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        label="Title"
        value={formData.title}
        onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
        placeholder="Enter news title"
      />

      <Input
        label="Content"
        value={formData.content}
        onChangeText={(text) => setFormData(prev => ({ ...prev, content: text }))}
        placeholder="Enter news content"
        multiline
        numberOfLines={4}
        style={styles.contentInput}
      />

      <Input
        label="Category"
        value={formData.category}
        onChangeText={(text) => setFormData(prev => ({ ...prev, category: text }))}
        placeholder="Enter news category"
      />

      <Button
        title="Pick Image"
        variant="outline"
        onPress={handleImagePick}
        style={styles.button}
      />

      <Button
        title={isLoading ? "Creating..." : "Create News"}
        onPress={handleSubmit}
        disabled={isLoading}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
  },
  contentInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 16,
  },
}); 