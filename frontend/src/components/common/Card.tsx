import { StyleSheet } from 'react-native';
import { shadowStyle } from '@/theme';

const styles = StyleSheet.create({
  card: {
    ...shadowStyle,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
}); 