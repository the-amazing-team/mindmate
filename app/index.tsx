import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D0D14' }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)/insights" />;
  }

  return <Redirect href="/(auth)" />;
}
