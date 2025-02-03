import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, Modal, TextInput, Share } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { COLORS, FONTS } from '@/theme';
import { Loading } from '@/components/common/Loading';
import { getImageUrl } from '@/utils/imageHelper';
import { MaterialIcons } from '@expo/vector-icons';
import { viewNews, deleteNews, updateNews } from '@/redux/slices/newsSlice';
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

const categoryMapping: { [key: string]: string } = {
  'App Development': 'app-development',
  'Artificial Intelligence': 'artificial-intelligence',
  'Technology': 'technology',
  // Add more mappings as needed
};

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

  const categories = [
    { label: 'Select a category', value: '' },
    { label: 'App Development', value: 'app-development' },
    { label: 'Artificial Intelligence', value: 'artificial-intelligence' },
    { label: 'Technology', value: 'technology' }
  ];

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

      for (const line of lines) {
        if (urlPattern.test(line.trim())) {
          const url = line.trim();
          if (!processedUrls.has(url) && !urlPreviews[url]) {
            setProcessedUrls(prev => new Set(prev).add(url));
            const preview = await handleUrlPreview(url);
            if (preview) {
              setUrlPreviews(prev => ({
                ...prev,
                [url]: preview
              }));
            }
          }
        }
      }
    };

    loadUrlPreviews();
  }, [newsItem?.content]);

  const handleUrlPreview = async (url: string) => {
    try {
      const response = await fetch(url);
      const html = await response.text();
      
      const titleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/) ||
                       html.match(/<title[^>]*>([^<]*)<\/title>/);
      
      const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/) ||
                       html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:image"/);

      return {
        title: titleMatch?.[1] || 'Untitled',
        imageUrl: imageMatch?.[1] || '',
      };
    } catch (error) {
      console.log('Error fetching URL metadata:', error);
      return null;
    }
  };

  const renderContent = (content: string) => {
    if (!content) return null;

    return content.split('\n').map((part, index) => {
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
    const mappedCategory = categoryMapping[newsItem?.category || ''] || '';
    setEditedCategory(mappedCategory);
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

  const handleSaveEdit = async () => {
    if (!editedTitle.trim() || !editedContent.trim() || !editedCategory) {
      Alert.alert('Error', 'Title, content, and category cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const resultAction = await dispatch(updateNews({
        id,
        title: editedTitle,
        content: editedContent,
        category: editedCategory,
        imageUrl: editedCoverImage,
        contentImages: editedContentImages,
      }));

      if (updateNews.fulfilled.match(resultAction)) {
        setIsEditModalVisible(false);
        Alert.alert('Success', 'News updated successfully');
      } else if (updateNews.rejected.match(resultAction)) {
        const error = resultAction.payload || 'Failed to update news';
        Alert.alert('Error', typeof error === 'string' ? error : 'Failed to update news');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update news');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete News",
      "Are you sure you want to delete this news item? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(deleteNews(id));
              router.back();
            } catch (error) {
              Alert.alert("Error", "Failed to delete news item");
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

  if (!newsItem) {
    return <Loading />;
  }

  const coverImageUrl = newsItem.imageUrl ? getImageUrl(newsItem.imageUrl) : '';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {isAdmin ? (
        <View style={styles.adminControls}>
          <View style={styles.viewCountContainer}>
            <MaterialIcons name="visibility" size={20} color={COLORS.gray} />
            <Text style={styles.viewCountText}>
              {typeof newsItem.views === 'number' ? newsItem.views : 0}
            </Text>
          </View>
          
          <View style={styles.adminActions}>
            <TouchableOpacity
              style={styles.adminButton}
              onPress={handleShare}
            >
              <MaterialIcons name="share" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.adminButton}
              onPress={handleEdit}
            >
              <MaterialIcons name="edit" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.adminButton, styles.deleteButton]}
              onPress={handleDelete}
            >
              <MaterialIcons name="delete" size={24} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.adminControls}>
          <View style={styles.userActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShare}
            >
              <MaterialIcons name="share" size={20} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleContactUs}
            >
              <MaterialIcons name="mail" size={20} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>Contact Us</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{newsItem.category}</Text>
            </View>
          </View>
        ) : null}
        
        <View style={styles.content}>
          <Text style={styles.title}>{newsItem.title}</Text>
          
          <View style={styles.authorContainer}>
            <MaterialIcons name="person" size={20} color={COLORS.primary} />
            <Text style={styles.author}>
              {`${newsItem.author.firstName} ${newsItem.author.lastName}`}
            </Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.date}>
              {new Date(newsItem.createdAt).toLocaleDateString()}
            </Text>
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

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={editedCategory}
                  onValueChange={setEditedCategory}
                  style={styles.picker}
                  enabled={!isSubmitting}
                >
                  {categories.map((category, index) => (
                    <Picker.Item key={index} label={category.label} value={category.value} />
                  ))}
                </Picker>
              </View>

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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewCountText: {
    marginLeft: 6,
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
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
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
    gap: 8,
  },
  adminActions: {
    flexDirection: 'row',
    gap: 8,
  },
  adminButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 20,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
    opacity: 0.5,
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
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: COLORS.white,
  },
  picker: {
    height: 50,
  },
  userActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
}); 
