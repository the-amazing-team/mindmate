/**
 * chat.jsx
 * Pipeline C: user question → vector_search → context_retrieval → ai_response
 * Every message is grounded in the user's actual journal sections.
 * Context badges show which journal entries informed the response.
 */
import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  Pressable, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInLeft, FadeInRight } from 'react-native-reanimated';
import { C } from '@/constants/theme';

const QUICK_PROMPTS = [
  "What patterns do you see in my emotions?",
  "Why do I feel anxious after work?",
  "Help me understand my stress triggers",
  "What's been genuinely positive lately?",
];

interface ContextBadgeProps {
  ctx: { date: string; emotion: string; similarity: number }[];
}

function ContextBadge({ ctx }: ContextBadgeProps) {
  if (!ctx?.length) return null;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
      {ctx.slice(0, 3).map((c, i) => (
        <View key={i} style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8,
          backgroundColor: C.cyan + '18', borderWidth: 1, borderColor: C.cyan + '33' }}>
          <Text style={{ fontSize: 9, color: C.cyan }}>
            {c.date} · {c.emotion} · {c.similarity}% match
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function ChatScreen() {
  const user = null;
  const profile = null;
  const sections = [];
  const messages = [];
  const loading = false;
  const error = null;
  const send = async (text: string) => {};
  const reset = () => {};
  const runScheduler = (args: any) => {};

  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);

  const scrollToEnd = () =>
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);

  useEffect(() => { scrollToEnd(); }, [messages.length]);

  async function handleSend(text: string = input) {
    const t = text.trim();
    if (!t || loading) return;
    setInput('');
    await send(t);
  }

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View style={{ position: 'relative' }}>
          <View style={s.avatar}><Text style={{ fontSize: 18 }}>🤖</Text></View>
          <View style={s.dot} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.name}>MindMate AI</Text>
          <Text style={s.sub}>
            ● Online · {sections.length} journal sections loaded
          </Text>
        </View>
        <Pressable onPress={reset} style={s.resetBtn}>
          <Text style={{ fontSize: 11, color: C.muted }}>Reset</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 10 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const isAI = item.role === 'ai';
            return (
              <Animated.View
                entering={isAI ? FadeInLeft.delay(40).springify() : FadeInRight.delay(40).springify()}
                style={{ flexDirection: 'row', justifyContent: isAI ? 'flex-start' : 'flex-end', marginBottom: 10 }}
              >
                {isAI && <View style={s.msgAvatar}><Text style={{ fontSize: 12 }}>🤖</Text></View>}
                <View style={{ maxWidth: '80%' }}>
                  <View style={[s.bubble, isAI ? s.bAI : s.bUser]}>
                    <Text style={[s.bText, !isAI && { color: '#fff' }]}>{item.text}</Text>
                  </View>
                  {isAI && <ContextBadge ctx={item.context} />}
                </View>
              </Animated.View>
            );
          }}
          ListFooterComponent={loading ? (
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 10 }}>
              <View style={s.msgAvatar}><Text style={{ fontSize: 12 }}>🤖</Text></View>
              <View style={[s.bubble, s.bAI, { paddingVertical: 14 }]}>
                <View style={{ flexDirection: 'row', gap: 5 }}>
                  {[0, 1, 2].map(i => (
                    <View key={i} style={{ width: 7, height: 7, borderRadius: 4,
                      backgroundColor: C.neon, opacity: 0.35 + i * 0.25 }} />
                  ))}
                </View>
              </View>
            </View>
          ) : null}
        />

        {error ? (
          <View style={s.errBar}>
            <Text style={s.errText}>⚠ {error}</Text>
          </View>
        ) : null}

        <View style={s.inputRow}>
          <TextInput
            style={[s.input, input.length > 0 && { borderColor: C.neon + '55' }]}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSend()}
            placeholder="Ask about your mood, patterns, feelings..."
            placeholderTextColor={C.muted}
            returnKeyType="send"
            blurOnSubmit={false}
            multiline
          />
          <Pressable
            onPress={() => handleSend()}
            disabled={loading || !input.trim()}
            style={[s.sendBtn, (!input.trim() || loading) && { backgroundColor: C.muted + '44' }]}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>↑</Text>
            }
          </Pressable>
        </View>
        <Text style={{ textAlign: 'center', fontSize: 9, color: C.muted, paddingBottom: 8 }}>
          AI · Private · Responses grounded in your journal
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: C.void },
  header:     { flexDirection: 'row', alignItems: 'center', gap: 12,
                paddingHorizontal: 18, paddingVertical: 12,
                borderBottomWidth: 1, borderBottomColor: C.border },
  avatar:     { width: 40, height: 40, borderRadius: 14, backgroundColor: C.a1 + '44',
                borderWidth: 1, borderColor: C.neon + '44', alignItems: 'center', justifyContent: 'center' },
  dot:        { position: 'absolute', bottom: -1, right: -1, width: 10, height: 10,
                borderRadius: 5, backgroundColor: C.lime, borderWidth: 2, borderColor: C.void },
  name:       { fontSize: 15, fontWeight: '700', color: C.text },
  sub:        { fontSize: 11, color: C.lime },
  resetBtn:   { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
                borderWidth: 1, borderColor: C.border },
  msgAvatar:  { width: 28, height: 28, borderRadius: 10, backgroundColor: C.neon + '22',
                borderWidth: 1, borderColor: C.neon + '33', alignItems: 'center',
                justifyContent: 'center', marginRight: 8, alignSelf: 'flex-end' },
  bubble:     { borderRadius: 18, paddingVertical: 11, paddingHorizontal: 14 },
  bAI:        { backgroundColor: C.lift, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
                borderBottomLeftRadius: 4 },
  bUser:      { backgroundColor: C.a1, borderBottomRightRadius: 4 },
  bText:      { fontSize: 14, lineHeight: 21, color: C.text },
  ql:         { fontSize: 10, color: C.muted, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  qbtn:       { backgroundColor: C.lift, borderRadius: 12, padding: 13, marginBottom: 8,
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  qtext:      { fontSize: 13, color: C.sub },
  errBar:     { marginHorizontal: 14, marginBottom: 8, padding: 10, backgroundColor: C.rose + '18',
                borderRadius: 10, borderWidth: 1, borderColor: C.rose + '44' },
  errText:    { fontSize: 12, color: C.rose },
  inputRow:   { flexDirection: 'row', alignItems: 'flex-end', gap: 8,
                paddingHorizontal: 14, paddingTop: 8, paddingBottom: 6,
                borderTopWidth: 1, borderTopColor: C.border },
  input:      { flex: 1, backgroundColor: C.lift, borderWidth: 1.5,
                borderColor: 'rgba(255,255,255,0.08)', borderRadius: 16,
                paddingHorizontal: 13, paddingVertical: 10, color: C.text,
                fontSize: 14, maxHeight: 90 },
  sendBtn:    { width: 44, height: 44, borderRadius: 14, backgroundColor: C.a1,
                alignItems: 'center', justifyContent: 'center' },
});
