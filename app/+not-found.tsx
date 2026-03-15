import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '@/constants/theme';

export default function NotFound() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: C.void, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>404</Text>
      <Text style={{ fontSize: 16, color: C.sub, marginBottom: 24 }}>Screen not found</Text>
      <Pressable onPress={() => router.replace('/')} style={{
        backgroundColor: C.a1, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}>
        <Text style={{ color: C.text, fontWeight: '700' }}>Go Home</Text>
      </Pressable>
    </View>
  );
}
