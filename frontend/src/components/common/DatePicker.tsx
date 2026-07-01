import React, { useState } from 'react';
import { View, Platform, TouchableOpacity, Text, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, FONTS } from '@/theme';

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
}

export function DatePicker({ value, onChange, label }: DatePickerProps) {
  const [show, setShow] = useState(false);

  const handleChange = (_: any, selectedDate?: Date) => {
    setShow(false);
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      {Platform.OS === 'ios' ? (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          onChange={handleChange}
          style={styles.iOSPicker}
        />
      ) : (
        <>
          <TouchableOpacity onPress={() => setShow(true)}>
            <View style={styles.androidButton}>
              <Text style={styles.dateText}>
                {value.toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
          {show && (
            <DateTimePicker
              value={value}
              mode="date"
              display="default"
              onChange={handleChange}
            />
          )}
        </>
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
  iOSPicker: {
    width: '100%',
  },
  androidButton: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
  },
}); 