import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as Localization from 'expo-localization';

interface SettingsState {
  language: string;
}

const initialState: SettingsState = {
  language: Localization.locale.split('-')[0],
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
  },
});

export const { setLanguage } = settingsSlice.actions;
export default settingsSlice.reducer; 