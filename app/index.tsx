import { Redirect } from 'expo-router';

import { Loader } from '@/shared/ui/Loader';
import { useSessionQuery } from '@/store/movetaskApi';

export default function Index() {
  const { data, isLoading, isFetching } = useSessionQuery();

  if (isLoading || isFetching) {
    return <Loader />;
  }

  if (!data) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Redirect href="/(app)/(tabs)/projects" />;
}
