import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, Modal, TextInput, Share } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { COLORS, FONTS } from '@/theme';
import { Loading } from '@/components/common/Loading';
import { getImageUrl } from '@/utils/imageHelper';
import { MaterialIcons } from '@expo/vector-icons';
import { viewNews, deleteNews, updateNews, fetchNews } from '@/redux/slices/newsSlice';
import { NewsItem } from '@/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { isUserAdmin } from '@/types';
import * as MailComposer from 'expo-mail-composer';
import * as Localization from 'expo-localization';
import { OPENAI_API_KEY } from '../../../constants/config';
import axiosInstance from '@/api/axios';

const categoryMapping: { [key: string]: string } = {
  'App Development': 'app-development',
  'Artificial Intelligence': 'artificial-intelligence',
  'Technology': 'technology',
  // Add more mappings as needed
};

// Ters kategori eşleştirmesi için yeni bir mapping ekleyelim
const reverseCategoryMapping: { [key: string]: string } = {
  'app-development': 'App Development',
  'artificial-intelligence': 'Artificial Intelligence',
  'technology': 'Technology',
  // Add more mappings as needed
};

// Add this type for translation cache
interface TranslationCache {
  [key: string]: {
    [text: string]: string;
  };
}

// Add these near the top of the file, outside the component
const translationCache: TranslationCache = {};

// Add this helper function
async function translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    if (!OPENAI_API_KEY || !text.trim()) {
      return text;
    }

    // Cache kontrolü
    if (translationCache[targetLanguage]?.[text]) {
      return translationCache[targetLanguage][text];
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: `Translate the text to ${targetLanguage}. If you encounter any untranslatable terms, use the closest equivalent or keep them as is.`
        }, {
          role: "user",
          content: text
        }],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      return text;
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content?.trim() || text;

    // Cache sonucu
    if (!translationCache[targetLanguage]) {
      translationCache[targetLanguage] = {};
    }
    translationCache[targetLanguage][text] = translatedText;

    return translatedText;
  } catch (error) {
    return text; // Hata durumunda orijinal metni sessizce döndür
  }
}

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

// Response tipleri için interface'ler ekleyelim
interface FavoriteResponse {
  status: string;
  data: {
    isFavorited: boolean;
    favoriteCount: number;
  };
}

export default function NewsDetailScreen() {
  const params = useLocalSearchParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const dispatch = useAppDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = isUserAdmin(user);
  
  const { news } = useAppSelector(state => state.news);
  const newsItem = news.find((item: NewsItem) => item._id === id);
  const [urlPreviews, setUrlPreviews] = useState<{ [key: string]: { title: string; imageUrl: string } }>({});
  const [processedUrls, setProcessedUrls] = useState<Set<string>>(new Set());
  const insets = useSafeAreaInsets();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedCategory, setEditedCategory] = useState('');
  const [editedCoverImage, setEditedCoverImage] = useState('');
  const [editedContentImages, setEditedContentImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deviceLanguage] = useState(Localization.locale.split('-')[0]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  const categories = [
    { label: 'Select a category', value: '' },
    { label: 'App Development', value: 'app-development' },
    { label: 'Artificial Intelligence', value: 'artificial-intelligence' },
    { label: 'Technology', value: 'technology' }
  ].map(category => ({
    ...category,
    value: category.value || category.label?.toLowerCase().replace(/\s+/g, '-') || ''
  }));

  useEffect(() => {
    if (id && typeof id === 'string') {
      dispatch(viewNews(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    const loadUrlPreviews = async () => {
      if (!newsItem?.content) return;

      const lines = newsItem.content.split('\n');
      const urlPattern = /^https?:\/\/[^\s]+$/;
      const urlLines = lines.filter(line => urlPattern.test(line.trim()));

      // Tüm URL'leri paralel olarak işle
      const previewPromises = urlLines.map(async (line) => {
        const url = line.trim();
        if (!processedUrls.has(url) && !urlPreviews[url]) {
          const preview = await handleUrlPreview(url);
          if (preview) {
            return { url, preview };
          }
        }
        return null;
      });

      const results = await Promise.all(previewPromises);
      
      // Yeni previews'ları toplu olarak ekle
      const newPreviews = results.reduce<Record<string, any>>((acc, result) => {
        if (result) {
          acc[result.url] = result.preview;
          setProcessedUrls(prev => new Set(prev).add(result.url));
        }
        return acc;
      }, {});

      setUrlPreviews(prev => ({
        ...prev,
        ...newPreviews
      }));
    };

    loadUrlPreviews();
  }, [newsItem?.content]);

  const handleUrlPreview = async (url: string) => {
    try {
      const response = await fetch(url);
      const html = await response.text();
      
      // Title için birden fazla pattern kontrol et
      const titlePatterns = [
        /<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i,
        /<meta[^>]*content="([^"]*)"[^>]*property="og:title"[^>]*>/i,
        /<title[^>]*>([^<]*)<\/title>/i
      ];
      
      // Image için birden fazla pattern kontrol et
      const imagePatterns = [
        /<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i,
        /<meta[^>]*content="([^"]*)"[^>]*property="og:image"[^>]*>/i,
        /<meta[^>]*name="twitter:image"[^>]*content="([^"]*)"[^>]*>/i
      ];

      let title = 'Untitled';
      let imageUrl = '';

      // Title için tüm pattern'ları dene
      for (const pattern of titlePatterns) {
        const match = html.match(pattern);
        if (match?.[1]) {
          title = match[1];
          break;
        }
      }

      // Image için tüm pattern'ları dene
      for (const pattern of imagePatterns) {
        const match = html.match(pattern);
        if (match?.[1]) {
          imageUrl = match[1];
          break;
        }
      }

      return {
        title: title || url,
        imageUrl: imageUrl || '',
      };
    } catch (error) {
      console.log('Error fetching URL metadata:', error);
      return null;
    }
  };

  const handleTranslateContent = async () => {
    if (!newsItem || isTranslating) return;

    setIsTranslating(true);
    try {
      const translatedTitle = await translateText(newsItem.title, deviceLanguage);
      const contentParts = newsItem.content.split('\n');
      const translatedParts = await Promise.all(
        contentParts.map(async (part) => {
          const urlPattern = /^https?:\/\/[^\s]+$/;
          const imagePattern = /\[IMAGE:(.*?)\]/;
          
          if (urlPattern.test(part.trim()) || imagePattern.test(part)) {
            return part;
          }
          
          if (part.trim()) {
            return await translateText(part, deviceLanguage);
          }
          
          return part;
        })
      );

      setTranslatedContent(JSON.stringify({
        title: translatedTitle,
        content: translatedParts.join('\n')
      }));
      setShowOriginal(false);
    } catch (error) {
      setShowOriginal(true);
    } finally {
      setIsTranslating(false);
    }
  };

  const renderContent = (content: string) => {
    if (!content) return null;

    let contentToRender = content;
    if (!showOriginal && translatedContent) {
      const parsed = JSON.parse(translatedContent);
      contentToRender = parsed.content;
    }

    return contentToRender.split('\n').map((part, index) => {
      const imageMatch = part.match(/\[IMAGE:(.*?)\]/);
      if (imageMatch) {
        const imagePath = imageMatch[1];
        const fullImageUrl = getImageUrl(imagePath);
        
        return (
          <View key={`image-${index}`} style={styles.contentImageContainer}>
            <Image 
              source={{ uri: fullImageUrl }}
              style={styles.contentImage}
              resizeMode="cover"
              onError={() => console.warn('Content image load error:', fullImageUrl)}
            />
          </View>
        );
      }

      const urlPattern = /^https?:\/\/[^\s]+$/;
      if (urlPattern.test(part.trim())) {
        const url = part.trim();
        const preview = urlPreviews[url];
        
        if (preview) {
          return (
            <TouchableOpacity
              key={`url-${index}`}
              style={styles.urlPreviewContainer}
              onPress={() => Linking.openURL(url)}
              activeOpacity={0.8}
            >
              {preview.imageUrl && (
                <Image 
                  source={{ uri: preview.imageUrl }} 
                  style={styles.urlPreviewImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.urlPreviewContent}>
                <Text style={styles.urlPreviewTitle} numberOfLines={2}>
                  {preview.title || url}
                </Text>
                <Text style={styles.urlText} numberOfLines={1}>
                  {url}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }
        
        return (
          <TouchableOpacity
            key={`url-${index}`}
            onPress={() => Linking.openURL(url)}
          >
            <Text style={styles.urlText}>
              {url}
            </Text>
          </TouchableOpacity>
        );
      }

      return part.trim() ? (
        <Text key={`text-${index}`} style={styles.contentText}>
          {part}
        </Text>
      ) : null;
    });
  };

  const handleEdit = () => {
    setEditedTitle(newsItem?.title || '');
    setEditedContent(newsItem?.content || '');
    // Doğrudan newsItem'dan gelen kategoriyi kullan
    setEditedCategory(newsItem?.category?.toLowerCase().replace(/\s+/g, '-') || '');
    setEditedCoverImage(newsItem?.imageUrl ? getImageUrl(newsItem.imageUrl) : '');
    setEditedContentImages(extractContentImages(newsItem?.content || ''));
    setIsEditModalVisible(true);
  };

  const extractContentImages = (content: string) => {
    const imageRegex = /\[IMAGE:(.*?)\]/g;
    const matches = [...content.matchAll(imageRegex)];
    return matches.map(match => getImageUrl(match[1]));
  };

  const pickImage = async (type: 'cover' | 'content') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (type === 'cover') {
        setEditedCoverImage(result.assets[0].uri);
      } else {
        setEditedContentImages(prev => [...prev, result.assets[0].uri]);
      }
    }
  };

  const removeContentImage = (index: number) => {
    setEditedContentImages(prev => prev.filter((_, i) => i !== index));
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
              editedCategory === cat.value && styles.categoryOptionSelected
            ]}
            onPress={() => setEditedCategory(cat.value)}
          >
            <Text style={[
              styles.categoryOptionText,
              editedCategory === cat.value && styles.categoryOptionTextSelected
            ]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const handleSaveEdit = async () => {
    if (!editedTitle.trim() || !editedContent.trim() || !editedCategory) {
      Alert.alert('Error', 'Title, content, and category are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const resultAction = await dispatch(updateNews({
        id,
        title: editedTitle,
        content: editedContent,
        category: editedCategory.toLowerCase().trim(),
        imageUrl: editedCoverImage,
        contentImages: editedContentImages,
      }));

      if (updateNews.fulfilled.match(resultAction)) {
        setIsEditModalVisible(false);
        Alert.alert('Success', 'News updated successfully');
        dispatch(fetchNews());
      } else {
        const error = resultAction.payload || 'Failed to update news';
        Alert.alert('Error', typeof error === 'string' ? error : 'Failed to update news');
      }
    } catch (error) {
      console.error('Update news error:', error);
      Alert.alert('Error', 'Failed to update news');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Haberi Sil",
      "Bu haberi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
      [
        {
          text: "İptal",
          style: "cancel"
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(deleteNews(id));
              // Ana sayfaya dönmeden önce haberleri yenile
              await dispatch(fetchNews()); // fetchNews action'ını import etmeyi unutmayın
              router.replace('/(tabs)'); // replace kullanarak geri dönüşü engelliyoruz
            } catch (error) {
              Alert.alert("Hata", "Haber silinirken bir hata oluştu");
            }
          }
        }
      ]
    );
  };

  const handleContactUs = async () => {
    try {
      // Önce mailto URL'sini deneyelim çünkü bu daha güvenilir çalışır
      const mailtoUrl = `mailto:support@yourapp.com?subject=${encodeURIComponent(`Feedback about news: ${newsItem?.title || ''}`)}&body=${encodeURIComponent(`News ID: ${id}\n\nPlease write your message here...`)}`;
      
      const canOpenMailto = await Linking.canOpenURL(mailtoUrl);
      if (canOpenMailto) {
        await Linking.openURL(mailtoUrl);
        return;
      }

      // Mailto çalışmazsa MailComposer'ı deneyelim
      const isMailComposerAvailable = await MailComposer.isAvailableAsync();
      if (isMailComposerAvailable) {
        const result = await MailComposer.composeAsync({
          recipients: ['support@yourapp.com'],
          subject: `Feedback about news: ${newsItem?.title || ''}`,
          body: `News ID: ${id}\n\nPlease write your message here...`,
          isHtml: false,
        });

        if (result.status === 'sent') {
          Alert.alert("Success", "Email sent successfully");
        }
        return;
      }

      // Hiçbir yöntem çalışmazsa
      Alert.alert(
        "Error",
        "No email app is available on your device. Please install an email app and try again.",
        [{ text: "OK" }]
      );

    } catch (error) {
      console.error('Mail handling error:', error);
      Alert.alert(
        "Error",
        "Could not open email. Please make sure you have an email app installed.",
        [{ text: "OK" }]
      );
    }
  };

  const handleShare = async () => {
    try {
      // Universal URL (Web ve Deep Link için)
      const webUrl = `https://yourapp.com/news/${id}`;
      // Deep Link URL'i
      const deepLinkUrl = `yourapp://news/${id}`;
      
      const result = await Share.share({
        message: `${newsItem?.title}\n\nRead more: ${webUrl}`,
        url: webUrl, // iOS için
        title: newsItem?.title, // Android için
      });
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Could not share this news');
    }
  };

  // Favori durumunu kontrol et
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const response = await axiosInstance.get<FavoriteResponse>(`/news/${id}/favorite`);
        if (response.data.status === 'success') {
          setIsFavorited(response.data.data.isFavorited);
          setFavoriteCount(response.data.data.favoriteCount);
        }
      } catch (error) {
        console.error('Check favorite status error:', error);
      }
    };

    if (id && !isAdmin) {
      checkFavoriteStatus();
    }
  }, [id, isAdmin]);

  // Favori ekleme/çıkarma işlemi
  const handleFavoritePress = async () => {
    try {
      const method = isFavorited ? 'delete' : 'post';
      const response = await axiosInstance[method]<FavoriteResponse>(`/news/${id}/favorite`);
      
      if (response.data.status === 'success') {
        setIsFavorited(response.data.data.isFavorited);
        setFavoriteCount(response.data.data.favoriteCount);
      }
    } catch (error) {
      console.error('Favorite toggle error:', error);
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  if (!newsItem) {
    return <Loading />;
  }

  const coverImageUrl = newsItem.imageUrl ? getImageUrl(newsItem.imageUrl) : '';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={true}
        bounces={true}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 80
        }}
      >
        {coverImageUrl ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: coverImageUrl }}
              style={styles.coverImage}
              resizeMode="cover"
              onError={() => console.warn('Cover image load error:', coverImageUrl)}
            />
            <View style={styles.overlay} />
            <View style={styles.headerControls}>
              {isAdmin ? (
                <View style={styles.adminControls}>
                  <View style={styles.viewCountContainer}>
                    <MaterialIcons name="visibility" size={20} color={COLORS.white} />
                    <Text style={styles.viewCountText}>
                      {typeof newsItem.views === 'number' ? newsItem.views : 0}
                    </Text>
                  </View>
                  
                  <View style={styles.adminActions}>
                    <TouchableOpacity
                      style={styles.adminButton}
                      onPress={handleShare}
                    >
                      <MaterialIcons name="share" size={20} color={COLORS.white} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.adminButton}
                      onPress={handleEdit}
                    >
                      <MaterialIcons name="edit" size={20} color={COLORS.white} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.adminButton, styles.deleteButton]}
                      onPress={handleDelete}
                    >
                      <MaterialIcons name="delete" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.userControls}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleShare}
                  >
                    <MaterialIcons name="share" size={20} color={COLORS.white} />
                    <Text style={styles.actionButtonText}>Paylaş</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleContactUs}
                  >
                    <MaterialIcons name="mail" size={20} color={COLORS.white} />
                    <Text style={styles.actionButtonText}>İletişim</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity
                style={[styles.translationButton, isTranslating && styles.disabledButton]}
                onPress={() => {
                  if (translatedContent) {
                    setShowOriginal(!showOriginal);
                  } else {
                    handleTranslateContent();
                  }
                }}
                disabled={isTranslating}
              >
                <MaterialIcons 
                  name={translatedContent ? (showOriginal ? "g-translate" : "language") : "g-translate"} 
                  size={20} 
                  color={COLORS.white} 
                />
                <Text style={styles.translationButtonText}>
                  {isTranslating ? 'Çeviriliyor...' : 
                   translatedContent ? (showOriginal ? 'Çeviri' : 'Orijinal') : 
                   'Çevir'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{newsItem.category}</Text>
            </View>
          </View>
        ) : null}
        
        <View style={styles.content}>
          <Text style={styles.title}>
            {!showOriginal && translatedContent 
              ? JSON.parse(translatedContent || '{"title":""}').title 
              : newsItem.title}
          </Text>
          
          <View style={styles.authorContainer}>
            <MaterialIcons name="person" size={20} color={COLORS.primary} />
            <Text style={styles.author}>
              {`${newsItem.author.firstName} ${newsItem.author.lastName}`}
            </Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.date}>
              {new Date(newsItem.createdAt).toLocaleDateString()}
            </Text>
            
            {!isAdmin && (
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={handleFavoritePress}
              >
                <MaterialIcons
                  name={isFavorited ? "favorite" : "favorite-border"}
                  size={24}
                  color={isFavorited ? COLORS.error : COLORS.gray}
                />
                {favoriteCount > 0 && (
                  <Text style={styles.favoriteCount}>{favoriteCount}</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {renderContent(newsItem.content)}
        </View>
      </ScrollView>

      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit News</Text>
              <TouchableOpacity
                onPress={() => setIsEditModalVisible(false)}
                style={styles.closeButton}
                disabled={isSubmitting}
              >
                <MaterialIcons name="close" size={24} color={COLORS.dark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Cover Image</Text>
              <View style={styles.imagePickerContainer}>
                {editedCoverImage ? (
                  <View style={styles.selectedImageContainer}>
                    <Image 
                      source={{ uri: editedCoverImage }} 
                      style={styles.selectedImage} 
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => setEditedCoverImage('')}
                    >
                      <MaterialIcons name="close" size={20} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.imagePicker}
                    onPress={() => pickImage('cover')}
                  >
                    <MaterialIcons name="add-photo-alternate" size={24} color={COLORS.primary} />
                    <Text style={styles.imagePickerText}>Add Cover Image</Text>
                  </TouchableOpacity>
                )}
              </View>

              <CategoryPicker />

              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.input}
                value={editedTitle}
                onChangeText={setEditedTitle}
                placeholder="Enter title"
                multiline={false}
                editable={!isSubmitting}
              />

              <Text style={styles.inputLabel}>Content</Text>
              <TextInput
                style={[styles.input, styles.contentInput]}
                value={editedContent}
                onChangeText={setEditedContent}
                placeholder="Enter content"
                multiline={true}
                textAlignVertical="top"
                editable={!isSubmitting}
              />

              <Text style={styles.inputLabel}>Content Images</Text>
              <View style={styles.contentImagesContainer}>
                {editedContentImages.map((image, index) => (
                  <View key={index} style={styles.selectedImageContainer}>
                    <Image source={{ uri: image }} style={styles.selectedImage} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeContentImage(index)}
                    >
                      <MaterialIcons name="close" size={20} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.imagePicker}
                  onPress={() => pickImage('content')}
                >
                  <MaterialIcons name="add-photo-alternate" size={24} color={COLORS.primary} />
                  <Text style={styles.imagePickerText}>Add Content Image</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.footerButton, 
                  styles.cancelButton,
                  isSubmitting && styles.disabledButton
                ]}
                onPress={() => setIsEditModalVisible(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.footerButton, 
                  styles.saveButton,
                  isSubmitting && styles.disabledButton
                ]}
                onPress={handleSaveEdit}
                disabled={isSubmitting}
              >
                <Text style={[styles.buttonText, styles.saveButtonText]}>
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  imageContainer: {
    height: 300,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.medium,
    textTransform: 'uppercase',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    flex: 1,
    marginRight: 16,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  author: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    marginLeft: 8,
  },
  dot: {
    marginHorizontal: 8,
    color: COLORS.gray,
  },
  date: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  contentImageContainer: {
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contentImage: {
    width: '100%',
    height: 200,
  },
  contentText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
    lineHeight: 24,
    marginVertical: 8,
  },
  viewCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewCountText: {
    marginLeft: 6,
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  statsContainer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  stats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statText: {
    marginLeft: 4,
    color: COLORS.gray,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  urlPreviewContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  urlPreviewImage: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.lightGray,
  },
  urlPreviewContent: {
    padding: 16,
  },
  urlPreviewTitle: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    marginBottom: 8,
  },
  urlText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  adminControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  adminActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  adminButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
    borderRadius: 20,
  },

  deleteButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  },

  userControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },

  actionButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },

  headerControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    left: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    maxHeight: '80%',
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: FONTS.regular,
    marginBottom: 16,
    backgroundColor: COLORS.white,
  },
  contentInput: {
    height: 200,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  footerButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
  },
  saveButtonText: {
    color: COLORS.white,
  },
  disabledButton: {
    opacity: 0.6,
  },
  imagePickerContainer: {
    marginBottom: 16,
  },
  imagePicker: {
    height: 120,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
  imagePickerText: {
    marginTop: 8,
    color: COLORS.primary,
    fontFamily: FONTS.medium,
  },
  selectedImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  contentImagesContainer: {
    gap: 8,
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
  label: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    marginBottom: 8,
  },
  translationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  translationButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    padding: 8,
  },
  favoriteCount: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
  }
}); 
