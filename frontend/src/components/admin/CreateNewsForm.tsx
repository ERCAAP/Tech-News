import React, { useState } from 'react';
import { View, StyleSheet, Alert, Image, Text, Platform, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useAppDispatch } from '@/redux/hooks';
import { createNews } from '@/redux/slices/newsSlice';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONTS, shadowStyle } from '@/theme';

const NEWS_CATEGORIES = [
  { label: 'App Development', value: 'app' },
  { label: 'Artificial Intelligence', value: 'ai' },
  { label: 'Science', value: 'science' },
] as const;

type NewsCategory = typeof NEWS_CATEGORIES[number]['value'];

interface NewsFormData {
  title: string;
  displayTitle: string;
  content: string;
  category: NewsCategory | '';
  coverImage: string;
  contentImages: string[];
  contentWithImages: Array<{
    type: 'text' | 'image';
    content: string;
  }>;
}

export function CreateNewsForm() {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<NewsFormData>({
    title: '',
    displayTitle: '',
    content: '',
    category: '',
    coverImage: '',
    contentImages: [],
    contentWithImages: [],
  });
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const handleCoverImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormData(prev => ({ ...prev, coverImage: result.assets[0].uri }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleContentImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const newImages = result.assets.map(asset => asset.uri);
        setFormData(prev => ({
          ...prev,
          contentImages: [...prev.contentImages, ...newImages],
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const handleRemoveContentImage = (index: number) => {
    setFormData(prev => {
      // Resmi contentImages'dan kaldır
      const newContentImages = prev.contentImages.filter((_, i) => i !== index);
      
      // İçerikteki resim referansını da kaldır
      const newContent = prev.content.split('\n').filter(line => !line.includes(`[IMAGE-${index}]`)).join('\n');
      
      // Kalan resimlerin indekslerini güncelle
      let updatedContent = newContent;
      newContentImages.forEach((_, i) => {
        const oldIndex = i + (i >= index ? 1 : 0);
        updatedContent = updatedContent.replace(`[IMAGE-${oldIndex}]`, `[IMAGE-${i}]`);
      });

      return {
        ...prev,
        content: updatedContent,
        contentImages: newContentImages,
      };
    });
  };

  const handleContentImageInsert = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const currentContent = formData.content;
        const cursorPosition = currentContent.length; // Mevcut içeriğin sonuna ekle
        
        // Resmi contentImages'a ekle
        const newImages = [...formData.contentImages, result.assets[0].uri];
        
        // Yeni içeriği oluştur
        const newContent = currentContent + '\n[IMAGE-' + (newImages.length - 1) + ']\n';
        
        setFormData(prev => ({
          ...prev,
          content: newContent,
          contentImages: newImages,
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to insert image');
    }
  };

  const handleUrlInsert = () => {
    Alert.prompt(
      'Insert URL',
      'Enter the URL you want to insert',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Insert',
          onPress: (url?: string) => {
            if (url) {
              const currentContent = formData.content;
              const newContent = currentContent + `\n[URL=${url}]\n`;
              setFormData(prev => ({
                ...prev,
                content: newContent,
              }));
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content || !formData.category || !formData.coverImage) {
      Alert.alert('Error', 'Please fill all required fields and add a cover image');
      return;
    }

    try {
      setIsLoading(true);
      const form = new FormData();
      form.append('title', formData.title);
      form.append('displayTitle', formData.displayTitle);
      form.append('content', formData.content);
      form.append('category', formData.category);
      
      // Add cover image
      const coverImageUri = formData.coverImage;
      const coverFilename = coverImageUri.split('/').pop();
      const coverMatch = /\.(\w+)$/.exec(coverFilename || '');
      const coverType = coverMatch ? `image/${coverMatch[1]}` : 'image';
      
      form.append('coverImage', {
        uri: coverImageUri,
        name: coverFilename,
        type: coverType,
      } as any);

      // Add content images
      formData.contentImages.forEach((imageUri, index) => {
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : 'image';
        
        form.append(`contentImage${index}`, {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      });

      await dispatch(createNews(form)).unwrap();
      Alert.alert('Success', 'News created successfully');
      setFormData({
        title: '',
        displayTitle: '',
        content: '',
        category: '',
        coverImage: '',
        contentImages: [],
        contentWithImages: [],
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create news');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Cover Image Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Cover Image</Text>
            {formData.coverImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image 
                  source={{ uri: formData.coverImage }} 
                  style={styles.coverImagePreview} 
                  resizeMode="cover"
                />
                <Button
                  title="Change Cover Image"
                  variant="outline"
                  onPress={handleCoverImagePick}
                  style={styles.imageButton}
                />
              </View>
            ) : (
              <Button
                title="Add Cover Image"
                variant="outline"
                onPress={handleCoverImagePick}
                style={styles.imageButton}
                icon="image"
              />
            )}
          </View>

          {/* Basic Info Section */}
          <View style={styles.formSection}>
            <Input
              label="News Title"
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              placeholder="Enter news title"
              containerStyle={styles.inputContainer}
            />

            <Input
              label="Display Title"
              value={formData.displayTitle}
              onChangeText={(text) => setFormData(prev => ({ ...prev, displayTitle: text }))}
              placeholder="Enter title to display"
              containerStyle={styles.inputContainer}
            />

            <View style={styles.categoryContainer}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity 
                style={styles.categoryButton}
                onPress={() => setShowCategoryPicker(true)}
              >
                <Text style={styles.categoryButtonText}>
                  {formData.category ? 
                    NEWS_CATEGORIES.find(c => c.value === formData.category)?.label 
                    : 'Select a category'
                  }
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Content Images Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Content Images</Text>
            {formData.contentImages.length > 0 && (
              <ScrollView 
                horizontal 
                style={styles.contentImagesScroll}
                showsHorizontalScrollIndicator={false}
              >
                {formData.contentImages.map((uri, index) => (
                  <View key={index} style={styles.contentImageContainer}>
                    <Image 
                      source={{ uri }} 
                      style={styles.contentImagePreview} 
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveContentImage(index)}
                    >
                      <Text style={styles.removeImageText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* News Content Section */}
          <View style={styles.formSection}>
            <View style={styles.contentHeader}>
              <Text style={styles.sectionTitle}>News Content</Text>
              <View style={styles.contentActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { marginRight: 8 }]}
                  onPress={handleUrlInsert}
                >
                  <Text style={styles.actionButtonText}>Insert URL</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleContentImageInsert}
                >
                  <Text style={styles.actionButtonText}>Insert Image</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Input
              label=""
              value={formData.content}
              onChangeText={(text) => setFormData(prev => ({ ...prev, content: text }))}
              placeholder="Write your news content here..."
              multiline
              numberOfLines={8}
              containerStyle={styles.inputContainer}
              style={styles.contentInput}
            />
          </View>
        </View>
        <View style={styles.publishButtonWrapper}>
          <Button
            title={isLoading ? "Publishing..." : "Publish News"}
            onPress={handleSubmit}
            disabled={isLoading}
            style={styles.publishButton}
          />
        </View>
      </ScrollView>

      {/* Category Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {NEWS_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.value}
                style={[
                  styles.categoryOption,
                  formData.category === category.value && styles.selectedCategory
                ]}
                onPress={() => {
                  setFormData(prev => ({ ...prev, category: category.value }));
                  setShowCategoryPicker(false);
                }}
              >
                <Text style={[
                  styles.categoryOptionText,
                  formData.category === category.value && styles.selectedCategoryText
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 150,
  },
  container: {
    flex: 1,
    ...shadowStyle,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  formSection: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    marginBottom: 16,
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  coverImagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  categoryContainer: {
    marginBottom: 8,
  },
  categoryButton: {
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 8,
  },
  categoryButtonText: {
    color: COLORS.dark,
    fontSize: 16,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  contentActions: {
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  contentImagesContainer: {
    marginTop: 24,
  },
  contentImagesTitle: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    marginBottom: 12,
  },
  contentImagesScroll: {
    flexGrow: 0,
  },
  contentImageContainer: {
    marginRight: 12,
    position: 'relative',
  },
  contentImagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.danger,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentInput: {
    minHeight: 200,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  publishButtonWrapper: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  publishButton: {
    backgroundColor: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    marginBottom: 16,
    textAlign: 'center',
  },
  categoryOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: COLORS.lightGray,
  },
  selectedCategory: {
    backgroundColor: COLORS.primary,
  },
  categoryOptionText: {
    fontSize: 16,
    color: COLORS.dark,
    fontFamily: FONTS.regular,
  },
  selectedCategoryText: {
    color: COLORS.white,
    fontFamily: FONTS.medium,
  },
}); 