import { useHeaderHeight } from '@react-navigation/elements';
import { useMemo } from 'react';
import { Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Vertical padding for screen body content when using `Screen` (top safe area) plus a
 * transparent native-stack header. On Android, `useHeaderHeight()` can briefly or
 * persistently omit the status-bar segment while the header still draws in that space,
 * which lets content (e.g. tab pills) sit under the title.
 */
export function useContentPaddingBelowTransparentHeader(): number {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  return useMemo(() => {
    if (Platform.OS !== 'android') {
      return headerHeight;
    }
    const insetTop = insets.top;
    const statusBar = StatusBar.currentHeight ?? insetTop;
    const fromNavigator = headerHeight - insetTop;
    const minForToolbar = 56 + statusBar - insetTop;
    return Math.max(0, fromNavigator, minForToolbar);
  }, [headerHeight, insets.top]);
}
