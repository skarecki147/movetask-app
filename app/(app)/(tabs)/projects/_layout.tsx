import { Stack } from 'expo-router';

import { useMovetaskTheme } from '@/shared/theme/ThemeContext';
import { NeonHeaderTitle } from '@/shared/ui/NeonHeaderTitle';
import { ThemedHeaderBackground } from '@/shared/ui/ThemedHeaderBackground';

export default function ProjectsStackLayout() {
  const { colors } = useMovetaskTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTransparent: true,
        headerBackground: () => <ThemedHeaderBackground />,
        headerStyle: { backgroundColor: 'transparent' },
        headerTintColor: colors.text,
        headerTitle: (props) => <NeonHeaderTitle {...props} />,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Projects' }} />
      <Stack.Screen name="[projectId]" options={{ headerShown: false }} />
    </Stack>
  );
}
