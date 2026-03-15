import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { C } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

export default function SignupScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const { age, personality } = useLocalSearchParams();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleSignup() {
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError('Name, email and a 6+ character password are required.');
      return;
    }
    setLoading(true); setError('');
    
    const metadata = {
      age_group: age,
      personality_type: personality
    };

    const { data, error: err } = await signUp(email.trim(), password, name.trim(), metadata);
    setLoading(false);
    
    if (err) {
      setError(err.message);
    } else if (data?.user && !data?.session) {
      // User created but needs email confirmation
      setError('Account created! Please check your email to confirm your account before signing in.');
    } else {
      // Success - Redirect to insights or home
      router.replace('/(tabs)/insights');
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.void }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={{ marginBottom: 32 }}>
          <Text style={{ color: C.sub, fontSize: 14 }}>← Back</Text>
        </Pressable>
        <Text style={s.title}>Create account</Text>
        <Text style={s.sub}>Start your journaling journey</Text>

        {error ? <View style={s.errBox}><Text style={s.errText}>{error}</Text></View> : null}

        <TextInput style={s.input} value={name} onChangeText={setName}
          placeholder="Your name" placeholderTextColor={C.muted} autoCapitalize="words" />
        <TextInput style={s.input} value={email} onChangeText={setEmail}
          placeholder="Email" placeholderTextColor={C.muted} autoCapitalize="none"
          keyboardType="email-address" autoComplete="email" />
        <TextInput style={s.input} value={password} onChangeText={setPassword}
          placeholder="Password (6+ characters)" placeholderTextColor={C.muted} secureTextEntry />

        <Pressable style={[s.btn, loading && { opacity: 0.7 }]} onPress={handleSignup} disabled={loading}>
          {loading ? <ActivityIndicator color={C.text} /> : <Text style={s.btnText}>Create Account</Text>}
        </Pressable>

        <Pressable onPress={() => router.push('/(auth)/login')} style={{ marginTop: 20 }}>
          <Text style={{ color: C.sub, textAlign: 'center' }}>
            Have an account? <Text style={{ color: C.neon }}>Sign in</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { padding: 28, paddingTop: 60 },
  title:     { fontSize: 28, fontWeight: '800', color: C.text, marginBottom: 6 },
  sub:       { fontSize: 14, color: C.sub, marginBottom: 32 },
  input:     { backgroundColor: C.lift, borderWidth: 1, borderColor: C.border, borderRadius: 14,
               paddingHorizontal: 16, paddingVertical: 14, color: C.text, fontSize: 15, marginBottom: 12 },
  btn:       { backgroundColor: C.a1, paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 8 },
  btnText:   { color: C.text, fontSize: 16, fontWeight: '700' },
  errBox:    { backgroundColor: C.rose + '18', borderRadius: 10, padding: 12, marginBottom: 16,
               borderWidth: 1, borderColor: C.rose + '44' },
  errText:   { color: C.rose, fontSize: 13 },
});
