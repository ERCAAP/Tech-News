import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, Text, TouchableOpacity, TextInput } from 'react-native';
import { COLORS, FONTS } from '@/theme';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/common/Button';
import { useAppSelector } from '@/redux/hooks';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { TextArea } from '@/components/common/TextArea';
import { MaterialIcons } from '@expo/vector-icons';

export default function CreateNewsScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [displayTitle, setDisplayTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [contentImages, setContentImages] = useState<string[]>([]);
  const token = useAppSelector(state => state.auth.token);

  const handleSelectCoverImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCoverImage(result.assets[0].uri);
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
        setContentImages([...contentImages, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick content image');
    }
  };

  const handleCreateNews = async () => {
    try {
      setIsLoading(true);
      
      if (!title || !content) {
        Alert.alert('Error', 'Title and content are required');
        return;
      }

      const formData = new FormData();

      // Ana verileri ekle
      formData.append('title', title);
      formData.append('displayTitle', displayTitle);
      formData.append('category', category);
      formData.append('content', content);

      // Cover image'i ekle
      if (coverImage) {
        const coverImageName = coverImage.split('/').pop() || 'cover.jpg';
        formData.append('coverImage', {
          uri: coverImage,
          type: 'image/jpeg',
          name: coverImageName,
        } as any);

        console.log('Adding cover image:', coverImage); // Debug için
      }

      // Content images'ları ekle
      if (contentImages.length > 0) {
        contentImages.forEach((imageUri, index) => {
          const imageName = imageUri.split('/').pop() || `content-${index}.jpg`;
          formData.append('contentImages', {
            uri: imageUri,
            type: 'image/jpeg',
            name: imageName,
          } as any);
        });

        console.log('Adding content images:', contentImages); // Debug için
      }

      // Form verilerini kontrol et
      console.log('Form data entries:');
      for (let [key, value] of (formData as any).entries()) {
        console.log(key, value);
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/news`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const responseData = await response.json();
      console.log('Server response:', responseData); // Debug için

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create news');
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
        <View style={styles.coverImageSection}>
          <Text style={styles.sectionTitle}>Cover Image</Text>
          <TouchableOpacity 
            style={styles.coverImageContainer}
            onPress={handleSelectCoverImage}
          >
            {coverImage ? (
              <Image 
                source={{ uri: coverImage }} 
                style={styles.coverImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.addCoverImage}>
                <MaterialIcons name="add-photo-alternate" size={32} color={COLORS.primary} />
                <Text style={styles.addCoverText}>Add Cover Image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>News Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter news title"
          />
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Display Title</Text>
          <TextInput
            style={styles.input}
            value={displayTitle}
            onChangeText={setDisplayTitle}
            placeholder="Enter title to display"
          />
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>News Category</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="e.g., Technology, Sports, Politics"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>News Details</Text>
          <TextArea
            label="News Content"
            value={content}
            onChangeText={setContent}
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
          {contentImages.map((uri, index) => (
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
  coverImageSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    marginBottom: 8,
  },
  section: {
    marginBottom: 16,
  },
  coverImageContainer: {
    height: 200,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  addCoverImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCoverText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  inputSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
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