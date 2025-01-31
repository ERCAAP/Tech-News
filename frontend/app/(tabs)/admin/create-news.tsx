import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, Text, TouchableOpacity } from 'react-native';
import { COLORS, FONTS } from '@/theme';
import { Header } from '@/components/common/Header';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useAppSelector } from '@/redux/hooks';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { TextArea } from '@/components/common/TextArea';
import { MaterialIcons } from '@expo/vector-icons';

export default function CreateNewsScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    coverImage: '',
    contentImages: [],
  });

  const handlePickCoverImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormData(prev => ({ ...prev, coverImage: result.assets[0].uri }));
        console.log('📸 Cover image selected:', result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick cover image');
    }
  };

  const handlePickContentImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormData(prev => ({
          ...prev,
          contentImages: [...prev.contentImages, result.assets[0].uri]
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick content image');
    }
  };

  const handleCreateNews = async () => {
    try {
      setIsLoading(true);
      
      if (!formData.title || !formData.content) {
        Alert.alert('Error', 'Title and content are required');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('category', formData.category);

      if (formData.coverImage) {
        const coverImageName = formData.coverImage.split('/').pop();
        formDataToSend.append('coverImage', {
          uri: formData.coverImage,
          name: coverImageName,
          type: 'image/jpeg',
        });
      }

      formData.contentImages.forEach((imageUri, index) => {
        const imageName = imageUri.split('/').pop();
        formDataToSend.append('contentImages', {
          uri: imageUri,
          name: imageName,
          type: 'image/jpeg',
        });
      });

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/news`, {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create news');
      }

      Alert.alert('Success', 'News created successfully');
      router.back();
    } catch (error) {
      console.error('Create news error:', error);
      Alert.alert('Error', 'Failed to create news');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveContentImage = (index: number) => {
    // Implement the logic to remove the image from the contentImages array
    console.log(`Removing image at index: ${index}`);
  };

  return (
    <View style={styles.container}>
      <Header title="Create News" showBack />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cover Image</Text>
          <View style={styles.coverImageContainer}>
            {formData.coverImage ? (
              <>
                <Image 
                  source={{ uri: formData.coverImage }} 
                  style={styles.coverImage}
                  resizeMode="cover"
                />
                <Button
                  title="Change Cover Image"
                  onPress={handlePickCoverImage}
                  style={styles.imageButton}
                  variant="outline"
                  icon="image"
                />
              </>
            ) : (
              <Button
                title="Add Cover Image"
                onPress={handlePickCoverImage}
                style={styles.imageButton}
                variant="outline"
                icon="image"
              />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>News Details</Text>
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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content Images</Text>
          <Button
            title="Add Content Image"
            onPress={handlePickContentImage}
            style={styles.imageButton}
            variant="outline"
            icon="image"
          />
          {formData.contentImages.map((uri, index) => (
            <View key={index} style={styles.contentImageContainer}>
              <Image 
                source={{ uri }} 
                style={styles.contentImage}
                resizeMode="cover"
              />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => handleRemoveContentImage(index)}
              >
                <MaterialIcons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

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
  section: {
    marginBottom: 24,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginBottom: 16,
  },
  coverImageContainer: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.border,
  },
  coverImage: {
    width: '100%',
    height: 200,
    marginBottom: 8,
  },
  imageButton: {
    marginBottom: 8,
  },
  contentImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  contentImage: {
    width: '80%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    backgroundColor: COLORS.error,
    borderRadius: 12,
    padding: 4,
    marginLeft: 8,
  },
  publishButton: {
    marginVertical: 24,
  },
}); 