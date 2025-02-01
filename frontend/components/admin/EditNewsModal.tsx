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
  Platform 
} from 'react-native';
import { useAppDispatch } from '@/redux/hooks';
import { updateNewsAsync } from '@/redux/slices/newsSlice';
import { COLORS, FONTS } from '@/theme';
import { NewsItem } from '@/types';
import * as ImagePicker from 'expo-image-picker';

interface EditNewsModalProps {
  visible: boolean;
  onClose: () => void;
  news: NewsItem;
}

export function EditNewsModal({ visible, onClose, news }: EditNewsModalProps) {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    title: news.title,
    content: news.content,
    category: news.category,
    imageUrl: news.imageUrl,
  });

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
      await dispatch(updateNewsAsync({ 
        newsId: news._id, 
        data: formData 
      })).unwrap();
      
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
            
            <TouchableOpacity 
              style={styles.imageButton}
              onPress={handleImagePick}
            >
              <Text>Change Image</Text>
            </TouchableOpacity>
            
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
}); 