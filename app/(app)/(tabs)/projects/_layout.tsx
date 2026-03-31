import { Stack } from 'expo-router';

/**
 * Stack inside the Projects tab so opening a project keeps the bottom tab bar visible.
 */
export default function ProjectsStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[projectId]" options={{ headerShown: false }} />
    </Stack>
  );
}
