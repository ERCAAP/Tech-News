import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from '../../src/components/common/Button';
import { COLORS, FONTS } from '@/theme';

interface DatePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
}

export function DatePicker({ label, value, onChange }: DatePickerProps) {
  const [show, setShow] = React.useState(false);

  const handleChange = (_: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Button
        title={value ? value.toLocaleDateString() : 'Select Date'}
        onPress={() => setShow(true)}
        variant="outline"
      />
      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    marginBottom: 8,
  },
}); 