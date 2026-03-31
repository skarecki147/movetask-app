import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { THEME_STORAGE_KEY } from '@/shared/constants/storageKeys';
import type { ColorPalette } from '@/shared/theme/tokens';
import { darkColors, lightColors } from '@/shared/theme/tokens';
import type { ThemePreference } from '@/shared/types/ui';
import type { RootState } from '@/store/store';
import { setThemePreference } from '@/store/uiSlice';

type ThemeContextValue = {
  preference: ThemePreference;
  resolved: 'light' | 'dark';
  colors: ColorPalette;
  setPreference: (p: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function MovetaskThemeProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const preference = useSelector((s: RootState) => s.ui.themePreference);
  const systemScheme = useSystemColorScheme();

  const resolved: 'light' | 'dark' =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const colors = resolved === 'dark' ? darkColors : lightColors;

  const setPreference = useCallback(
    (p: ThemePreference) => {
      dispatch(setThemePreference(p));
      void AsyncStorage.setItem(THEME_STORAGE_KEY, p);
    },
    [dispatch],
  );

  const value = useMemo(
    () => ({ preference, resolved, colors, setPreference }),
    [preference, resolved, colors, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useMovetaskTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useMovetaskTheme must be used within MovetaskThemeProvider');
  }
  return ctx;
}
