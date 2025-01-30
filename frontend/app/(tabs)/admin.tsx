import React, { useState, useRef } from 'react';
import { ScrollView, StyleSheet, View, Alert, Image, TouchableOpacity, Text, TextInput } from 'react-native';
import { Header } from '@/components/common/Header';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useAppSelector } from '@/redux/hooks';
import { isUserAdmin } from '@/types';
import { COLORS, FONTS } from '@/theme';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

const NEWS_CATEGORIES = ['AI', 'APP', 'Science'] as const;
type NewsCategory = typeof NEWS_CATEGORIES[number];

interface FormData {
  title: string;
  content: string;
  images: string[];
  category: NewsCategory | '';
}

// KeyboardEvent tipini ekleyelim
interface KeyboardEvent {
  nativeEvent: {
    key: string;
  };
}

export default function AdminScreen() {
  const { user } = useAppSelector(state => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    images: [],
    category: '',
  });
  const [keywords, setKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const contentInputRef = useRef<TextInput>(null);

  // Admin değilse ana sayfaya yönlendir
  if (!user || !isUserAdmin(user)) {
    router.replace('/(tabs)');
    return null;
  }

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        allowsMultipleSelection: true,
      });

      if (!result.canceled) {
        // Resimleri images array'ine ekle
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...result.assets.map(asset => asset.uri)]
        }));

        // Seçilen her resim için content'e [Image-X] ekle
        const imageIndexes = result.assets.map((_, index) => {
          const imageNumber = formData.images.length + index;
          return `[Image-${imageNumber + 1}]`;
        });

        // Content sonuna resim referansını ekle
        const newContent = formData.content + '\n' + imageIndexes.join('\n') + '\n';

        setFormData(prev => ({
          ...prev,
          content: newContent
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSelectCategory = (category: NewsCategory) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category === category ? '' : category
    }));
  };

  const addKeyword = () => {
    if (currentKeyword.trim() && !keywords.includes(currentKeyword.trim())) {
      setKeywords(prev => [...prev, currentKeyword.trim()]);
      setCurrentKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(prev => prev.filter(k => k !== keyword));
  };

  const handlePublish = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!formData.content.trim()) {
      Alert.alert('Error', 'Please enter content');
      return;
    }

    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    try {
      setIsLoading(true);
      // TODO: API call to create news
      Alert.alert('Success', 'News published successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to publish news');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Create News" showBack />
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Input
          label="News Title"
          value={formData.title}
          onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
          placeholder="Enter an attention-grabbing title"
        />

        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.categoriesContainer}>
          {NEWS_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                formData.category === category && styles.selectedCategoryChip
              ]}
              onPress={() => handleSelectCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                formData.category === category && styles.selectedCategoryText
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Content</Text>
        <View style={styles.editorContainer}>
          <TextInput
            ref={contentInputRef}
            style={styles.editor}
            value={formData.content}
            onChangeText={(text) => setFormData(prev => ({ ...prev, content: text }))}
            placeholder="Write your news content here... Add images using the button below"
            placeholderTextColor={COLORS.gray}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />
        </View>

        <Text style={styles.sectionTitle}>Images</Text>
        <Button
          title="Add Images"
          onPress={handlePickImage}
          style={styles.imageButton}
          variant="outline"
          icon="image"
        />

        <ScrollView 
          horizontal 
          style={styles.imagesScrollView}
          showsHorizontalScrollIndicator={false}
        >
          {formData.images.map((uri, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => handleRemoveImage(index)}
              >
                <MaterialIcons name="close" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Keywords</Text>
        <View style={styles.keywordsContainer}>
          <View style={styles.keywordInputContainer}>
            <Input
              label=""
              value={currentKeyword}
              onChangeText={setCurrentKeyword}
              placeholder="Add keywords"
            />
            <Button
              title="Add"
              onPress={addKeyword}
              style={styles.addKeywordButton}
              variant="outline"
            />
          </View>
          <View style={styles.keywordChips}>
            {keywords.map((keyword) => (
              <TouchableOpacity
                key={keyword}
                style={styles.keywordChip}
                onPress={() => removeKeyword(keyword)}
              >
                <Text style={styles.keywordText}>{keyword}</Text>
                <MaterialIcons name="close" size={16} color={COLORS.white} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button
          title={isLoading ? "Publishing..." : "Publish News"}
          onPress={handlePublish}
          disabled={isLoading}
          style={styles.publishButton}
          isLoading={isLoading}
        />

        <View style={styles.bottomPadding} />
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
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    marginRight: 12,
    marginBottom: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.dark,
    fontSize: 16,
    fontFamily: FONTS.medium,
  },
  selectedCategoryText: {
    color: COLORS.white,
  },
  editorContainer: {
    height: 300,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  editor: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
    textAlignVertical: 'top',
  },
  imageButton: {
    marginBottom: 16,
  },
  imagesScrollView: {
    flexGrow: 0,
    marginBottom: 16,
  },
  imageContainer: {
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: 120,
    height: 120,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  keywordsContainer: {
    marginBottom: 16,
  },
  keywordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addKeywordButton: {
    minWidth: 80,
  },
  keywordChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  keywordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  keywordText: {
    color: COLORS.white,
    marginRight: 4,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  publishButton: {
    marginVertical: 24,
  },
  bottomPadding: {
    height: 50,
  },
}); 