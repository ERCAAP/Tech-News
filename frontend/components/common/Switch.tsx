import React from 'react';
import { Switch as RNSwitch, SwitchProps } from 'react-native';
import { COLORS } from '@/theme';

interface CustomSwitchProps extends Omit<SwitchProps, 'trackColor'> {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function Switch({ value, onValueChange, ...props }: CustomSwitchProps) {
  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: COLORS.gray, true: COLORS.primary }}
      thumbColor={value ? COLORS.white : COLORS.lightGray}
      ios_backgroundColor={COLORS.gray}
      {...props}
    />
  );
} 