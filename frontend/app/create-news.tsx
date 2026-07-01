import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, Text } from 'react-native';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { createNews } from '@/redux/slices/newsSlice';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONTS, shadowStyle } from '@/theme';
import { router } from 'expo-router';
import { isUserAdmin } from '@/types';
import { Switch } from '../components/common/Switch';
import { MaterialIcons } from '@expo/vector-icons';
import { useNotifications } from '../hooks/useNotifications';

export default function CreateNewsScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    videoUrl: '',
    category: '',
  });
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const { sendNotification } = useNotifications();

  // Admin kontrolü
  if (!user || !isUserAdmin(user)) {
    router.replace('/');
    return null;
  }

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormData(prev => ({
          ...prev,
          imageUrl: result.assets[0].uri
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.content) {
        Alert.alert('Error', 'Title and content are required');
        return;
      }

      setIsLoading(true);
      const result = await dispatch(createNews({
        ...formData,
        notification: notificationEnabled ? {
          enabled: true,
          title: notificationTitle,
          message: notificationMessage
        } : undefined
      })).unwrap();

      Alert.alert('Success', 'News created successfully');
      router.back();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to create news. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Input
          label="Title"
          value={formData.title}
          onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
          placeholder="Enter news title"
        />

        <Input
          label="Category"
          value={formData.category}
          onChangeText={(text) => setFormData(prev => ({ ...prev, category: text }))}
          placeholder="Enter news category"
        />

        <Input
          label="Content"
          value={formData.content}
          onChangeText={(text) => setFormData(prev => ({ ...prev, content: text }))}
          placeholder="Enter news content"
          multiline
          numberOfLines={6}
        />

        <Input
          label="Video URL (Optional)"
          value={formData.videoUrl}
          onChangeText={(text) => setFormData(prev => ({ ...prev, videoUrl: text }))}
          placeholder="Enter YouTube or video URL"
        />

        <View style={styles.imagePreview}>
          {formData.imageUrl ? (
            <>
              <Image
                source={{ uri: formData.imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
              
              <View style={styles.notificationSection}>
                <Text style={styles.sectionTitle}>Notification Settings</Text>
                <View style={styles.notificationRow}>
                  <Text style={styles.label}>Send Push Notification</Text>
                  <Switch
                    value={notificationEnabled}
                    onValueChange={setNotificationEnabled}
                  />
                </View>

                {notificationEnabled && (
                  <View style={styles.notificationForm}>
                    <Input
                      label="Notification Title"
                      value={notificationTitle}
                      onChangeText={setNotificationTitle}
                      placeholder="Enter notification title"
                      {...{ maxLength: 50 }}
                    />
                    <Input
                      label="Notification Message"
                      value={notificationMessage}
                      onChangeText={setNotificationMessage}
                      placeholder="Enter short notification message"
                      {...{ maxLength: 100 }}
                      multiline
                    />
                  </View>
                )}
              </View>
            </>
          ) : null}
        </View>

        <Button
          title={isLoading ? "Creating..." : "Create News"}
          onPress={handleSubmit}
          disabled={isLoading}
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  form: {
    margin: 16,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    ...shadowStyle,
  },
  imagePreview: {
    marginVertical: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  imageButton: {
    marginVertical: 8,
  },
  submitButton: {
    marginTop: 16,
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