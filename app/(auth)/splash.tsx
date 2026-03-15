import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '@/constants/theme';

export default function SplashScreen() {
  const router = useRouter();
  return (
    <View style={s.container}>
      <Text style={s.logo}>✦</Text>
      <Text style={s.title}>MindMate</Text>
      <Text style={s.sub}>Reflect. Evolve. Connect.</Text>
      <Pressable style={s.btn} onPress={() => router.push('/(auth)/login')}>
        <Text style={s.btnText}>Sign In</Text>
      </Pressable>
      <Pressable style={s.ghost} onPress={() => router.push('/(auth)/signup')}>
        <Text style={s.ghostText}>Create Account</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.void, alignItems: 'center', justifyContent: 'center', padding: 32 },
  logo:      { fontSize: 64, color: C.neon, marginBottom: 16 },
  title:     { fontSize: 36, fontWeight: '800', color: C.text, marginBottom: 8 },
  sub:       { fontSize: 14, color: C.sub, marginBottom: 48 },
  btn:       { backgroundColor: C.a1, paddingVertical: 16, paddingHorizontal: 48, borderRadius: 16, marginBottom: 12, width: '100%', alignItems: 'center' },
  btnText:   { color: C.text, fontSize: 16, fontWeight: '700' },
  ghost:     { paddingVertical: 16, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: C.border, borderRadius: 16 },
  ghostText: { color: C.sub, fontSize: 16 },
});
