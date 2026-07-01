import React, { useState } from 'react';
import { View, StyleSheet, Alert, Image, TouchableOpacity, Text, Linking } from 'react-native';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useAppDispatch } from '@/redux/hooks';
import { createNews } from '@/redux/slices/newsSlice';
import { COLORS, FONTS } from '@/theme';

// Kategori seçenekleri ve gösterim isimleri
const CATEGORIES = [
  { id: 'Technology', label: 'Technology' },
  { id: 'AI', label: 'Artificial Intelligence' },
  { id: 'App', label: 'App Development' }
] as const;

export function NewsForm() {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '' as typeof CATEGORIES[number]['id'],
    imageUrl: '',
  });


  const handleCategorySelect = (categoryId: typeof CATEGORIES[number]['id']) => {
    setFormData(prev => ({ ...prev, category: categoryId }));
    setShowCategoryPicker(false);
  };

  const handleUrlInput = async (url: string) => {
    const cleanUrl = url.trim();
    if (cleanUrl.startsWith('http')) {
      try {
        const isValid = await Linking.canOpenURL(cleanUrl);
        if (isValid) {
          // Fetch URL metadata
          try {
            const response = await fetch(cleanUrl);
            const html = await response.text();
            
            // Extract og:image or first image from HTML
            
            // Extract title
            const titleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/) ||
                             html.match(/<title[^>]*>([^<]*)<\/title>/);

            setFormData(prev => ({ 
              ...prev, 
              imageUrl: cleanUrl,
              title: prev.title || titleMatch?.[1] || '',
            }));
          } catch (error) {
            // If metadata fetch fails, still set the URL
            setFormData(prev => ({ ...prev, imageUrl: cleanUrl }));
          }
        } else {
          Alert.alert('Error', 'Invalid URL');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to validate URL');
      }
    }
  };

  const handleUrlPress = () => {
    if (formData.imageUrl?.startsWith('http')) {
      Linking.openURL(formData.imageUrl).catch(() => {
        Alert.alert('Error', 'Failed to open URL');
      });
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
      // Kategoriyi tam olarak seçilen değer olarak gönder
      form.append('category', formData.category); // Değişiklik yok, sadece doğru değerin gönderildiğinden emin oluyoruz
      
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

      // Debug için log ekleyelim
      console.log('Sending category:', formData.category);

      await dispatch(createNews(form)).unwrap();
      Alert.alert('Success', 'News created successfully');
      setFormData({
        title: '',
        content: '',
        category: '' as typeof CATEGORIES[number]['id'],
        imageUrl: '',
      });
    } catch (error: any) {
      console.error('Error details:', error); // Debug için hata detaylarını görelim
      Alert.alert('Error', error.message || 'Failed to create news');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageSection}>
        {formData.imageUrl ? (
          <View style={styles.imagePreviewContainer}>
            {formData.imageUrl.startsWith('http') && (
              <TouchableOpacity 
                style={styles.urlPreviewContainer}
                onPress={handleUrlPress}
              >
                <Image 
                  source={{ uri: formData.imageUrl }} 
                  style={styles.previewImage} 
                  resizeMode="cover"
                />
                <View style={styles.urlOverlay}>
                  <Text style={styles.urlText} numberOfLines={2}>
                    {formData.imageUrl}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          </View>
        ) : null}
      </View>

      <Input
        label="Image URL"
        value={formData.imageUrl}
        onChangeText={handleUrlInput}
        placeholder="Enter image URL"
        autoCapitalize="none"
        keyboardType="default"
      />

      <Input
        label="News Title"
        value={formData.title}
        onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
        placeholder="Enter an attention-grabbing title"
        style={styles.titleInput}
      />

      <TouchableOpacity
        style={styles.categoryButton}
        onPress={() => setShowCategoryPicker(true)}
      >
        <Text style={styles.categoryButtonText}>
          {CATEGORIES.find(c => c.id === formData.category)?.label || 'Select Category'}
        </Text>
      </TouchableOpacity>

      {showCategoryPicker && (
        <View style={styles.categoryPicker}>
          <Text style={styles.pickerTitle}>Select Category</Text>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryOption,
                formData.category === category.id && styles.selectedCategory
              ]}
              onPress={() => handleCategorySelect(category.id)}
            >
              <Text style={[
                styles.categoryOptionText,
                formData.category === category.id && styles.selectedCategoryText
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Input
        label="News Content"
        value={formData.content}
        onChangeText={(text) => setFormData(prev => ({ ...prev, content: text }))}
        placeholder="Write your news content here..."
        multiline
        numberOfLines={8}
        style={styles.contentInput}
      />

      <Button
        title={isLoading ? "Publishing..." : "Publish News"}
        onPress={handleSubmit}
        disabled={isLoading}
        style={styles.publishButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageSection: {
    marginBottom: 16,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  imageButton: {
    marginBottom: 16,
  },
  titleInput: {
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  contentInput: {
    height: 200,
    textAlignVertical: 'top',
    paddingTop: 12,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  publishButton: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
  },
  categoryButton: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  categoryButtonText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
  },
  categoryPicker: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    right: '10%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    elevation: 5,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pickerTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginBottom: 16,
    textAlign: 'center',
  },
  categoryOption: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedCategory: {
    backgroundColor: COLORS.primary,
  },
  categoryOptionText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: COLORS.white,
  },
  urlPreviewContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.lightGray,
  },
  urlOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
  },
  urlText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 