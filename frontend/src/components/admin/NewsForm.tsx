import React, { useState } from 'react';
import { View, StyleSheet, Alert, Image, TouchableOpacity, Text } from 'react-native';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useAppDispatch } from '@/redux/hooks';
import { createNews } from '@/redux/slices/newsSlice';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONTS } from '@/theme';

// Kategori seçenekleri backend ile eşleşmeli
const CATEGORIES = [
  'Technology',
  'AI',
  'App'
] as const;

type Category = typeof CATEGORIES[number];

export function NewsForm() {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '' as Category,
    imageUrl: '',
  });

  const handleImagePick = async () => {
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
        setFormData(prev => ({ ...prev, imageUrl: result.assets[0].uri }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleCategorySelect = (category: Category) => {
    setFormData(prev => ({ ...prev, category }));
    setShowCategoryPicker(false);
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
        category: '' as Category,
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
            <Image 
              source={{ uri: formData.imageUrl }} 
              style={styles.imagePreview} 
              resizeMode="cover"
            />
            <Button
              title="Change Image"
              variant="outline"
              onPress={handleImagePick}
              style={styles.imageButton}
            />
          </View>
        ) : (
          <Button
            title="Add News Image"
            variant="outline"
            onPress={handleImagePick}
            style={styles.imageButton}
            icon="image"
          />
        )}
      </View>

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
          {formData.category || 'Select Category'}
        </Text>
      </TouchableOpacity>

      {showCategoryPicker && (
        <View style={styles.categoryPicker}>
          <Text style={styles.pickerTitle}>Select Category</Text>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryOption,
                formData.category === category && styles.selectedCategory
              ]}
              onPress={() => handleCategorySelect(category)}
            >
              <Text style={[
                styles.categoryOptionText,
                formData.category === category && styles.selectedCategoryText
              ]}>
                {category}
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
}); 