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
  urls: Array<{
    url: string;
    title: string;
    imageUrl: string;
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
    urls: [],
  });
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');
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
    
    // Son satırda URL var mı kontrol et
    const lines = text.split('\n');
    const lastLine = lines[lines.length - 1];
    const urlMatch = lastLine.match(/https?:\/\/[^\s]+/);
    
    if (urlMatch) {
      const url = urlMatch[0].trim();
      handleUrlPreview(url);
    }
  };

  // URL önizleme fonksiyonu güncellendi
  const handleUrlPreview = async (url: string) => {
    try {
      // URL zaten eklenmiş mi kontrol et
      const isUrlExists = formData.urls.some(item => item.url === url);
      if (isUrlExists) {
        return; // URL zaten varsa işlemi sonlandır
      }

      const isValid = await Linking.canOpenURL(url);
      if (isValid) {
        try {
          const response = await fetch(url);
          const html = await response.text();
          
          const titleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/) ||
                           html.match(/<title[^>]*>([^<]*)<\/title>/);
          
          const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/) ||
                           html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:image"/);

          const title = titleMatch?.[1] || 'Untitled';
          const imageUrl = imageMatch?.[1] || '';

          // URL'yi urls array'ine ekle
          setFormData(prev => ({
            ...prev,
            urls: [...prev.urls, { url, title, imageUrl }],
            // Eğer cover image boşsa ve URL'nin resmi varsa, onu cover image olarak kullan
            coverImage: !prev.coverImage && imageUrl ? imageUrl : prev.coverImage
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

  // URL önizlemelerini render etmek için yeni fonksiyon
  const renderUrlPreviews = () => {
    if (formData.urls.length === 0) return null;

    return (
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>URL Previews</Text>
        {formData.urls.map((urlData, index) => (
          <View key={index} style={styles.previewUrlContainer}>
            <Image 
              source={{ uri: urlData.imageUrl }} 
              style={styles.previewUrlImage} 
              resizeMode="cover"
            />
            <View style={styles.previewUrlInfo}>
              <Text style={styles.previewUrlTitle} numberOfLines={2}>
                {urlData.title}
              </Text>
              <TouchableOpacity
                onPress={() => handleUrlClick(urlData.url)}
              >
                <Text style={styles.previewUrlLink} numberOfLines={1}>
                  {urlData.url}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.removeUrlButton}
              onPress={() => handleRemoveUrl(index)}
            >
              <Text style={styles.removeImageText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  // URL kaldırma işlevi
  const handleRemoveUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      urls: prev.urls.filter((_, i) => i !== index)
    }));
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

      // İçeriği temizle - URL preview işaretlerini kaldır
      const cleanContent = processedContent
        .split('\n')
        .filter(line => !line.startsWith('[URL:'))
        .join('\n');

      // URL'leri içeriğe ekle
      const contentWithUrls = formData.urls.reduce((content, urlData) => {
        return content + `\n${urlData.url}\n`;
      }, cleanContent);

      // Haberi oluştur
      const newsData = {
        title: formData.title,
        displayTitle: formData.displayTitle || formData.title,
        content: contentWithUrls,
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

  // Resim ekleme işlevi
  const handleContentImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant media library permissions to upload images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const { uri } = result.assets[0];
        
        // Geçici dosya oluştur
        const fileExtension = uri.split('.').pop();
        const fileName = `${Date.now()}.${fileExtension}`;
        const newUri = FileSystem.documentDirectory + fileName;
        
        try {
          await FileSystem.copyAsync({
            from: uri,
            to: newUri
          });
          
          // İçerik resimlerine ekle
          setFormData(prev => {
            const newIndex = prev.contentImages.length;
            return {
              ...prev,
              contentImages: [...prev.contentImages, newUri],
              content: prev.content + `\n[IMAGE-${newIndex}]\n`
            };
          });
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

  // URL ekleme işlevi
  const handleInsertUrl = () => {
    setShowUrlModal(true);
  };

  // URL ekleme işlevi için yeni fonksiyon
  const handleAddUrl = () => {
    if (urlInput.trim()) {
      handleUrlPreview(urlInput.trim());
      setUrlInput('');
      setShowUrlModal(false);
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
          {/* Cover Image Section - Artık en üstte */}
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

          {/* Basic Info Section - Artık ikinci sırada */}
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
            
            {/* Content Toolbar */}
            <View style={styles.contentToolbar}>
              <TouchableOpacity 
                style={styles.toolbarButton}
                onPress={handleContentImagePick}
              >
                <Text style={styles.toolbarButtonText}>Insert Image</Text>
              </TouchableOpacity>
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
            </View>
          </View>

          {/* URL Previews Section - Artık ayrı bir bölüm */}
          {renderUrlPreviews()}

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

      {/* URL Insert Modal */}
      <Modal
        visible={showUrlModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUrlModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowUrlModal(false)}
        >
          <View style={styles.urlModalContent}>
            <Text style={styles.modalTitle}>Insert URL</Text>
            
            <TextInput
              value={urlInput}
              onChangeText={setUrlInput}
              placeholder="Enter URL here..."
              style={styles.urlInput}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setUrlInput('');
                  setShowUrlModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddUrl}
              >
                <Text style={styles.addButtonText}>Add URL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    minWidth: 120,
  },
  toolbarButtonText: {
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
  urlText: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
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
  previewUrlImage: {
    width: '100%',
    height: 160,
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
  urlModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    ...shadowStyle,
  },
  urlInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  addButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: COLORS.dark,
    fontSize: 16,
    fontFamily: FONTS.medium,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.medium,
  },
  previewUrlContainer: {
    width: '100%',
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    ...shadowStyle,
  },
  previewUrlInfo: {
    padding: 12,
  },
  previewUrlTitle: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    marginBottom: 8,
  },
  previewUrlLink: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  removeUrlButton: {
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
}); 