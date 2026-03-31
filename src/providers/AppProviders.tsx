import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import { THEME_STORAGE_KEY } from '@/shared/constants/storageKeys';
import { MovetaskThemeProvider } from '@/shared/theme/ThemeContext';
import type { ThemePreference } from '@/shared/types/ui';
import { store } from '@/store/store';
import { setThemePreference } from '@/store/uiSlice';

function isThemePreference(x: string | null): x is ThemePreference {
  return x === 'light' || x === 'dark' || x === 'system';
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void (async () => {
      const raw = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (isThemePreference(raw)) {
        store.dispatch(setThemePreference(raw));
      }
    })();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <Provider store={store}>
        <MovetaskThemeProvider>{children}</MovetaskThemeProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
