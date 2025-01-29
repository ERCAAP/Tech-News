import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useAppDispatch } from '@/redux/hooks';
import { addNews } from '@/redux/slices/newsSlice';
import { COLORS } from '@/theme';
import * as ImagePicker from 'expo-image-picker';

export default function AdminScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement API call to upload image and create news
      const newNews = {
        id: Date.now().toString(),
        title,
        content,
        category,
        imageUrl,
        author: 'Admin',
        publishedAt: new Date().toISOString(),
        likes: 0,
        isFavorited: false,
      };
      
      dispatch(addNews(newNews));
      setTitle('');
      setContent('');
      setCategory('');
      setImageUrl('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Input
        label="Title"
        value={title}
        onChangeText={setTitle}
        placeholder="Enter news title"
      />
      <Input
        label="Category"
        value={category}
        onChangeText={setCategory}
        placeholder="Enter news category"
      />
      <Input
        label="Content"
        value={content}
        onChangeText={setContent}
        placeholder="Enter news content"
        multiline
        numberOfLines={6}
        style={styles.contentInput}
      />
      <Button
        title="Pick Image"
        onPress={handleImagePick}
        variant="outline"
        style={styles.button}
      />
      <Button
        title={isLoading ? "Publishing..." : "Publish News"}
        onPress={handleSubmit}
        isLoading={isLoading}
        style={styles.button}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  contentInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    marginVertical: 8,
  },
}); 