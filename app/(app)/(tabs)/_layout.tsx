import type { ComponentProps } from 'react';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useRouter } from 'expo-router';

import { useAuthFacade } from '@/modules/auth/application/useAuthFacade';
import { useMovetaskTheme } from '@/shared/theme/ThemeContext';
import { AppIconButton } from '@/shared/ui/AppIconButton';

function TabBarIcon(props: {
  name: ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -2 }} {...props} />;
}

export default function TabsLayout() {
  const router = useRouter();
  const { colors } = useMovetaskTheme();
  const { signOut } = useAuthFacade();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}>
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color }) => <TabBarIcon name="folder-open" color={color} />,
        }}
      />
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
          headerRight: () => (
            <AppIconButton
              accessibilityLabel="Sign out"
              onPress={() => {
                void signOut().then(() => router.replace('/(auth)/sign-in'));
              }}>
              <FontAwesome name="sign-out" size={22} color={colors.text} />
            </AppIconButton>
          ),
        }}
      />
    </Tabs>
  );
}
