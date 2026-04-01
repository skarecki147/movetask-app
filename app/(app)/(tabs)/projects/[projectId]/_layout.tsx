import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { useProjectsFacade } from '@/modules/projects/application/useProjectsFacade';
import { useMovetaskTheme } from '@/shared/theme/ThemeContext';
import { AppIconButton } from '@/shared/ui/AppIconButton';
import { NeonHeaderTitle } from '@/shared/ui/NeonHeaderTitle';
import { ThemedHeaderBackground } from '@/shared/ui/ThemedHeaderBackground';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ProjectLayout() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const { colors } = useMovetaskTheme();
  const { projects } = useProjectsFacade();

  const title = useMemo(() => {
    const p = projects.data?.find((x) => x.id === projectId);
    return p?.name ?? 'Project';
  }, [projects.data, projectId]);

  const listHref = {
    pathname: '/(app)/(tabs)/projects/[projectId]/list' as const,
    params: { projectId },
  };
  const boardHref = {
    pathname: '/(app)/(tabs)/projects/[projectId]' as const,
    params: { projectId },
  };

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTransparent: true,
        headerBackground: () => <ThemedHeaderBackground />,
        headerStyle: { backgroundColor: 'transparent' },
        headerTintColor: colors.text,
        headerTitle: (props) => <NeonHeaderTitle {...props} />,
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        title,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title,
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppIconButton
                accessibilityLabel="Open list view"
                onPress={() => router.push(listHref)}
              >
                <FontAwesome name="list" size={22} color={colors.text} />
              </AppIconButton>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="list"
        options={{
          title: `${title} — List`,
          headerRight: () => (
            <AppIconButton
              accessibilityLabel="Open board view"
              onPress={() => router.push(boardHref)}
            >
              <FontAwesome name="columns" size={20} color={colors.text} />
            </AppIconButton>
          ),
        }}
      />
      <Stack.Screen name="task/new" options={{ title: 'New task' }} />
      <Stack.Screen name="task/[taskId]" options={{ title: 'Task' }} />
    </Stack>
  );
}
