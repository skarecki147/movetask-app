import { Redirect, Slot } from 'expo-router';

import { Loader } from '@/shared/ui/Loader';
import { useSessionQuery } from '@/store/movetaskApi';

export default function AppGroupLayout() {
  const { data, isLoading, isFetching } = useSessionQuery();

  if (isLoading || isFetching) {
    return <Loader />;
  }

  if (!data) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Slot />;
}
