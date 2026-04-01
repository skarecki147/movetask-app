import { Redirect, Stack } from 'expo-router';

import { useMovetaskTheme } from '@/shared/theme/ThemeContext';
import { Loader } from '@/shared/ui/Loader';
import { NeonHeaderTitle } from '@/shared/ui/NeonHeaderTitle';
import { ThemedHeaderBackground } from '@/shared/ui/ThemedHeaderBackground';
import { useSessionQuery } from '@/store/movetaskApi';

export default function AuthLayout() {
  const { data, isLoading, isFetching } = useSessionQuery();
  const { colors } = useMovetaskTheme();

  if (isLoading || isFetching) {
    return <Loader />;
  }

  if (data) {
    return <Redirect href="/(app)/(tabs)/projects" />;
  }

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
        title: 'MoveTask',
      }}
    >
      <Stack.Screen name="sign-in" options={{ title: 'Sign in' }} />
      <Stack.Screen name="sign-up" options={{ title: 'Sign up' }} />
    </Stack>
  );
}
