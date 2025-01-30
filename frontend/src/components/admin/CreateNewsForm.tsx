import React, { useState } from 'react';
import { View, StyleSheet, Alert, Image, Text, Platform, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useAppDispatch } from '@/redux/hooks';
import { createNews } from '@/redux/slices/newsSlice';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONTS, shadowStyle } from '@/theme';
import { MaterialIcons } from '@expo/vector-icons';

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
    <View style={styles.mainContainer}>
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
            <ScrollView 
              horizontal 
              style={styles.contentImagesScroll}
              showsHorizontalScrollIndicator={false}
            >
              {formData.contentImages.length > 0 ? (
                formData.contentImages.map((uri, index) => (
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
                ))
              ) : (
                <Text style={styles.noImagesText}>No images added yet</Text>
              )}
            </ScrollView>
          </View>

          {/* News Content Section */}
          <View style={styles.formSection}>
            <View style={styles.contentHeader}>
              <Text style={styles.sectionTitle}>News Content</Text>
              <Button
                title={isLoading ? "Publishing..." : "Publish News"}
                onPress={handleSubmit}
                disabled={isLoading}
                style={styles.publishButton}
              />
            </View>
            
            <View style={styles.contentToolbar}>
              <TouchableOpacity
                style={styles.toolbarButton}
                onPress={handleUrlInsert}
              >
                <MaterialIcons name="link" size={20} color={COLORS.primary} />
                <Text style={styles.toolbarButtonText}>Insert URL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.toolbarButton}
                onPress={handleContentImageInsert}
              >
                <MaterialIcons name="image" size={20} color={COLORS.primary} />
                <Text style={styles.toolbarButtonText}>Insert Image</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.contentInputWrapper}>
              <TextInput
                value={formData.content}
                onChangeText={(text) => setFormData(prev => ({ ...prev, content: text }))}
                placeholder="Write your news content here..."
                multiline
                style={styles.contentInput}
                placeholderTextColor={COLORS.gray}
              />
            </View>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 160, // Daha fazla bottom spacing
  },
  container: {
    gap: 16,
  },
  formSection: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    ...shadowStyle,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: COLORS.dark,
    marginBottom: 16,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  coverImagePreview: {
    width: '100%',
    height: 200,
    marginBottom: 16,
  },
  imageButton: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  categoryContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    marginBottom: 8,
  },
  categoryButton: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  categoryButtonText: {
    color: COLORS.dark,
    fontSize: 16,
    fontFamily: FONTS.medium,
    textAlign: 'center',
  },
  contentImagesScroll: {
    minHeight: 120,
  },
  contentImageContainer: {
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadowStyle,
  },
  contentImagePreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  noImagesText: {
    color: COLORS.gray,
    fontFamily: FONTS.medium,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 40,
  },
  contentToolbar: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 8,
  },
  toolbarButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  toolbarButtonText: {
    marginLeft: 8,
    color: COLORS.dark,
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  contentInputWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 2,
  },
  contentInput: {
    minHeight: 200,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  bottomSpacing: {
    height: 100,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  publishButton: {
    minWidth: 120,
    height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    ...shadowStyle,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: FONTS.semiBold,
    color: COLORS.dark,
    marginBottom: 24,
    textAlign: 'center',
  },
  categoryOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  selectedCategory: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryOptionText: {
    fontSize: 16,
    color: COLORS.dark,
    fontFamily: FONTS.medium,
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: COLORS.white,
  },
}); 