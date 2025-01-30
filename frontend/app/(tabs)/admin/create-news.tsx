import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { COLORS } from '@/theme';
import { Header } from '@/components/common/Header';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useAppSelector } from '@/redux/hooks';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { TextArea } from '@/components/common/TextArea';

export default function CreateNewsScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',
    category: '',
  });

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormData(prev => ({ ...prev, image: result.assets[0].uri }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleCreateNews = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement news creation logic
      Alert.alert('Success', 'News created successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create news');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Create News" showBack />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Button
          title="Add News Image"
          onPress={handlePickImage}
          style={styles.imageButton}
          variant="outline"
          icon="image"
        />

        {formData.image ? (
          <View style={styles.imagePreview}>
            <Image 
              source={{ uri: formData.image }} 
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        ) : null}

        <Input
          label="News Title"
          value={formData.title}
          onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
          placeholder="Enter an attention-grabbing title"
        />

        <Input
          label="News Category"
          value={formData.category}
          onChangeText={(text) => setFormData(prev => ({ ...prev, category: text }))}
          placeholder="e.g., Technology, Sports, Politics"
        />
        
        <TextArea
          label="News Content"
          value={formData.content}
          onChangeText={(text) => setFormData(prev => ({ ...prev, content: text }))}
          placeholder="Write your news content here..."
          numberOfLines={8}
        />

        <Button
          title={isLoading ? "Publishing..." : "Publish News"}
          onPress={handleCreateNews}
          disabled={isLoading}
          style={styles.publishButton}
          isLoading={isLoading}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  imageButton: {
    marginBottom: 16,
  },
  imagePreview: {
    marginBottom: 16,
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  publishButton: {
    marginVertical: 24,
  },
}); 