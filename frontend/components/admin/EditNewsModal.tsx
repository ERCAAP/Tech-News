import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView,
  Alert,
  ToastAndroid,
  Platform,
  Linking,
  Image
} from 'react-native';
import { useAppDispatch } from '@/redux/hooks';
import { updateNews } from '@/redux/slices/newsSlice';
import { COLORS, FONTS, shadowStyle } from '@/theme';
import { NewsItem } from '@/types';
import * as ImagePicker from 'expo-image-picker';
import { Switch } from '../common/Switch';
import { Input } from '../common/Input';

interface FormData {
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  notification: {
    enabled: boolean;
    title: string;
    message: string;
  };
}

interface EditNewsModalProps {
  visible: boolean;
  onClose: () => void;
  news: NewsItem;
}

export function EditNewsModal({ visible, onClose, news }: EditNewsModalProps) {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<FormData>({
    title: news.title,
    content: news.content,
    category: news.category,
    imageUrl: news.imageUrl,
    notification: {
      enabled: false,
      title: '',
      message: ''
    }
  });

  const handleImagePress = () => {
    if (formData.imageUrl?.startsWith('http')) {
      const cleanUrl = formData.imageUrl.trim();
      Linking.canOpenURL(cleanUrl).then(supported => {
        if (supported) {
          Linking.openURL(cleanUrl);
        } else {
          Alert.alert('Error', 'Cannot open this URL');
        }
      }).catch(() => {
        Alert.alert('Error', 'Failed to open URL');
      });
    }
  };

  const handleImagePick = async () => {
    try {
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

  const handleSave = async () => {
    try {
      const updateData = {
        id: news._id,
        title: formData.title,
        content: formData.content,
        category: formData.category,
        imageUrl: formData.imageUrl,
        ...(formData.notification.enabled && {
          notification: {
            enabled: true,
            title: formData.notification.title,
            message: formData.notification.message
          }
        })
      };

      await dispatch(updateNews(updateData)).unwrap();
      
      if (Platform.OS === 'android') {
        ToastAndroid.show('News updated successfully', ToastAndroid.SHORT);
      } else {
        Alert.alert('Success', 'News updated successfully');
      }
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update news');
    }
  };

  const updateNotification = (updates: Partial<FormData['notification']>) => {
    setFormData(prev => ({
      ...prev,
      notification: {
        ...prev.notification,
        ...updates
      }
    }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit News</Text>
          
          <ScrollView>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              placeholder="Title"
            />
            
            <TextInput
              style={[styles.input, styles.contentInput]}
              value={formData.content}
              onChangeText={(text) => setFormData(prev => ({ ...prev, content: text }))}
              placeholder="Content"
              multiline
            />
            
            <TextInput
              style={styles.input}
              value={formData.category}
              onChangeText={(text) => setFormData(prev => ({ ...prev, category: text }))}
              placeholder="Category"
            />

            <TextInput
              style={styles.input}
              value={formData.imageUrl}
              onChangeText={(text) => setFormData(prev => ({ ...prev, imageUrl: text.trim() }))}
              placeholder="Enter URL"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />

            {formData.imageUrl?.startsWith('http') && (
              <View style={styles.previewContainer}>
                <TouchableOpacity 
                  style={styles.urlContainer}
                  onPress={handleImagePress}
                >
                  <Text style={styles.urlText} numberOfLines={2}>
                    {formData.imageUrl}
                  </Text>
                </TouchableOpacity>
                
                <Image
                  source={{ uri: formData.imageUrl }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.imageButton}
              onPress={handleImagePick}
            >
              <Text>Pick Image</Text>
            </TouchableOpacity>
            
            <View style={styles.notificationSection}>
              <Text style={styles.sectionTitle}>Push Notification</Text>
              
              <View style={styles.notificationRow}>
                <Text style={styles.label}>Send Update Notification</Text>
                <Switch
                  value={formData.notification.enabled}
                  onValueChange={(value) => updateNotification({ enabled: value })}
                />
              </View>

              {formData.notification.enabled && (
                <View style={styles.notificationForm}>
                  <Input
                    label="Notification Title"
                    value={formData.notification.title}
                    onChangeText={(text) => updateNotification({ title: text })}
                    placeholder="Enter notification title"
                    maxLength={50}
                  />

                  <Input
                    label="Notification Message"
                    value={formData.notification.message}
                    onChangeText={(text) => updateNotification({ message: text })}
                    placeholder="Enter notification message"
                    maxLength={100}
                    multiline
                  />
                </View>
              )}
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    margin: 20,
    borderRadius: 8,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 10,
    marginBottom: 16,
    fontFamily: FONTS.regular,
  },
  contentInput: {
    height: 150,
    textAlignVertical: 'top',
  },
  imageButton: {
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    color: COLORS.white,
    fontFamily: FONTS.medium,
  },
  previewContainer: {
    marginBottom: 16,
  },
  urlContainer: {
    padding: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    marginBottom: 8,
  },
  urlText: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  notificationSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    ...shadowStyle,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    marginBottom: 16,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  notificationForm: {
    marginTop: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
  },
}); 