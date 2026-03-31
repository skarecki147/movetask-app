import { Redirect, Stack } from 'expo-router';

import { Loader } from '@/shared/ui/Loader';
import { useSessionQuery } from '@/store/movetaskApi';

export default function AuthLayout() {
  const { data, isLoading, isFetching } = useSessionQuery();

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
        title: 'MoveTask',
      }}>
      <Stack.Screen name="sign-in" options={{ title: 'Sign in' }} />
      <Stack.Screen name="sign-up" options={{ title: 'Sign up' }} />
    </Stack>
  );
}
