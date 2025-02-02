import React, { useState } from 'react';
import { View, StyleSheet, Alert, Image, Text, TouchableOpacity, Modal, ScrollView, TextInput, Linking } from 'react-native';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { COLORS, FONTS, shadowStyle } from '@/theme';
import api from '@/api/axios';
import { useRouter } from 'expo-router';

const NEWS_CATEGORIES = [
  { label: 'App Development', value: 'app' },
  { label: 'Artificial Intelligence', value: 'ai' },
  { label: 'Technology', value: 'technology' },
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
  const router = useRouter();

  const handleCoverImagePick = async () => {
    try {
      // İzinleri kontrol et
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaStatus !== 'granted') {
        Alert.alert('Permission needed', 'Please grant media library permissions to upload images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        const { uri } = result.assets[0];
        
        // Geçici dosya oluştur
        const fileExtension = uri.split('.').pop();
        const fileName = `${Date.now()}.${fileExtension}`;
        const newUri = FileSystem.documentDirectory + fileName;
        
        try {
          // Dosyayı kopyala
          await FileSystem.copyAsync({
            from: uri,
            to: newUri
          });
          
          setFormData(prev => ({ ...prev, coverImage: newUri }));
        } catch (error) {
          console.error('Error copying file:', error);
          Alert.alert('Error', 'Failed to process image');
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
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


  // Content değiştiğinde URL kontrolü yap
  const handleContentChange = (text: string) => {
    setFormData(prev => ({ ...prev, content: text }));
    
    // URL kontrolü
    const urlMatch = text.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      const url = urlMatch[0].trim();
      handleUrlPreview(url);
    }
  };

  // URL önizleme fonksiyonu güncellendi
  const handleUrlPreview = async (url: string) => {
    try {
      const isValid = await Linking.canOpenURL(url);
      if (isValid) {
        try {
          const response = await fetch(url);
          const html = await response.text();
          
          // Extract title and image
          const titleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/) ||
                           html.match(/<title[^>]*>([^<]*)<\/title>/);
          
          const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/) ||
                           html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:image"/);

          const title = titleMatch?.[1] || '';
          const imageUrl = imageMatch?.[1] || '';

          // URL preview bloğunu oluştur
          const urlPreview = `
[URL_PREVIEW_START]
${url}
${title}
${imageUrl}
[URL_PREVIEW_END]
`;
          
          // Eski URL'yi yeni preview ile değiştir
          setFormData(prev => ({
            ...prev,
            content: prev.content.replace(url, urlPreview)
          }));
        } catch (error) {
          console.log('Error fetching URL metadata:', error);
        }
      }
    } catch (error) {
      console.log('Error validating URL:', error);
    }
  };

  // URL'ye tıklama işlevi
  const handleUrlClick = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open URL');
    });
  };

  // Content render fonksiyonu
  const renderContent = () => {
    if (!formData.content) return null;

    const parts = formData.content.split(/(\[URL_PREVIEW_START\].*?\[URL_PREVIEW_END\])/s);
    
    return parts.map((part, index) => {
      if (part.startsWith('[URL_PREVIEW_START]')) {
        const [, url, title, imageUrl] = part.split('\n');
        
        return (
          <View key={index} style={styles.urlPreviewBox}>
            <Text style={styles.urlPreviewTitle} numberOfLines={2}>
              {title}
            </Text>
            {imageUrl && (
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.urlPreviewImage}
                resizeMode="cover"
              />
            )}
            <TouchableOpacity 
              onPress={() => handleUrlClick(url)}
              style={styles.urlLinkContainer}
            >
              <Text style={styles.urlPreviewLink} numberOfLines={1}>
                {url}
              </Text>
            </TouchableOpacity>
          </View>
        );
      }
      return (
        <Text key={index} style={styles.contentText}>
          {part}
        </Text>
      );
    });
  };

  // Resmi sunucuya yükle ve URL al
  const uploadImage = async (uri: string): Promise<string> => {
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'image.jpg';
      
      formData.append('image', {
        uri,
        name: filename,
        type: 'image/jpeg',
      } as any);

      // Upload endpoint'ini news route'u altına taşıdık
      const response = await api.post('/news/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  // Form gönderme işlemini güncelle
  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Validasyon ekleyelim
      if (!formData.title || !formData.content || !formData.category) {
        Alert.alert('Error', 'Please fill all required fields');
        return;
      }

      // Kapak resmini yükle
      let coverImageUrl = '';
      if (formData.coverImage) {
        coverImageUrl = await uploadImage(formData.coverImage);
      }

      // İçerik resimlerini yükle
      const uploadedContentImages = await Promise.all(
        formData.contentImages.map(uploadImage)
      );

      // İçerikteki [IMAGE-X] referanslarını URL'lerle değiştir
      let processedContent = formData.content;
      uploadedContentImages.forEach((url, index) => {
        processedContent = processedContent.replace(
          `[IMAGE-${index}]`,
          `[IMAGE:${url}]`
        );
      });

      // Haberi oluştur
      const newsData = {
        title: formData.title,
        displayTitle: formData.displayTitle || formData.title,
        content: processedContent,
        category: formData.category,
        imageUrl: coverImageUrl,
        contentImages: uploadedContentImages,
      };

      await api.post('/news', newsData);
      
      Alert.alert('Success', 'News created successfully');
      router.back();
    } catch (error) {
      console.error('Error creating news:', error);
      Alert.alert('Error', 'Failed to create news');
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
          {/* Basic Info Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Basic Info</Text>
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
            
            <View style={styles.contentInputWrapper}>
              <TextInput
                value={formData.content}
                onChangeText={handleContentChange}
                placeholder="Write your news content here... Paste URL to preview"
                multiline
                style={styles.contentInput}
                placeholderTextColor={COLORS.gray}
              />
              
              <ScrollView style={styles.contentScrollView}>
                {renderContent()}
              </ScrollView>
            </View>
          </View>

          {/* Content Images Preview */}
          {formData.contentImages.length > 0 && (
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Content Images</Text>
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
            </View>
          )}

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
    fontFamily: FONTS.bold,
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
    padding: 12,
  },
  contentInput: {
    minHeight: 100,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    marginBottom: 12,
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
    fontFamily: FONTS.bold,
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
  urlPreviewBox: {
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  urlPreviewTitle: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    marginBottom: 8,
    padding: 12,
  },
  urlPreviewImage: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.lightGray,
  },
  urlLinkContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
    backgroundColor: '#FFFFFF',
  },
  urlPreviewLink: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  contentText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
    lineHeight: 24,
  },
  contentScrollView: {
    maxHeight: 400,
  },
}); 