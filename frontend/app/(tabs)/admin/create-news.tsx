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

// Kategori seçeneklerini tanımla
const CATEGORIES = [
  { 
    value: 'ai', 
    label: 'Artificial Intelligence',
    description: 'News about AI and machine learning'
  },
  { 
    value: 'app', 
    label: 'Applications',
    description: 'Mobile and web application news'
  },
  { 
    value: 'technology', 
    label: 'Technology',
    description: 'General technology news'
  }
];

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

  // URL'leri işlemek için yardımcı fonksiyon
  const processContent = (text: string) => {
    const lines = text.split('\n');
    const processedLines = lines.map(line => {
      // URL kontrolü
      const urlPattern = /^https?:\/\/[^\s]+$/;
      if (urlPattern.test(line.trim())) {
        return line.trim(); // URL'leri olduğu gibi bırak
      }
      return line; // URL olmayan satırları olduğu gibi bırak
    });
    return processedLines.join('\n');
  };

  // Content değiştiğinde URL'leri işle
  const handleContentChange = (text: string) => {
    const processedContent = processContent(text);
    setContent(processedContent);
  };

  const handleCreateNews = async () => {
    try {
      setIsLoading(true);
      
      if (!title || !content || !category) {
        Alert.alert('Error', 'Title, content and category are required');
        return;
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('displayTitle', displayTitle || title);
      formData.append('category', category.toLowerCase().trim());
      formData.append('content', processContent(content));
      
      // Cover image varsa ekle
      if (coverImage) {
        const coverImageName = coverImage.split('/').pop() || 'cover.jpg';
        formData.append('coverImage', {
          uri: coverImage,
          type: 'image/jpeg',
          name: coverImageName,
        } as any);
      }

      console.log('Sending request with token:', token);

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/news`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create news');
      }

      Alert.alert('Success', 'News created successfully');
      router.back();
    } catch (error: any) {
      console.error('Create news error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to create news. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveContentImage = (index: number) => {
    // Implement the logic to remove the image from the contentImages array
    console.log(`Removing image at index: ${index}`);
  };

  // Kategori seçimi için Picker komponenti
  const CategoryPicker = () => (
    <View style={styles.pickerContainer}>
      <Text style={styles.label}>Category</Text>
      <View style={styles.selectContainer}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            style={[
              styles.categoryOption,
              category === cat.value && styles.categoryOptionSelected
            ]}
            onPress={() => setCategory(cat.value)}
          >
            <Text style={[
              styles.categoryOptionText,
              category === cat.value && styles.categoryOptionTextSelected
            ]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

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

        <CategoryPicker />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>News Details</Text>
          <TextArea
            label="News Content"
            value={content}
            onChangeText={handleContentChange}
            placeholder="Write your news content here... You can add multiple URLs by putting each on a new line"
            numberOfLines={8}
          />
          <Text style={styles.urlHint}>
            Tip: Add URLs by putting each on a new line. Example:
          </Text>
          <Text style={styles.urlExample}>
            Your text here...{'\n'}
            https://example1.com{'\n'}
            More text here...{'\n'}
            https://example2.com
          </Text>
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
  urlHint: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginTop: 8,
  },
  urlExample: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.primary,
    backgroundColor: COLORS.lightGray,
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryOptionText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
  },
  categoryOptionTextSelected: {
    color: COLORS.white,
  },
}); 