/**
 * chat.jsx
 * Pipeline C: user question → vector_search → context_retrieval → ai_response
 * Every message is grounded in the user's actual journal sections.
 * Context badges show which journal entries informed the response.
 */
import { C } from "@/constants/theme";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInLeft, FadeInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

import { useChat } from "@/hooks/use-chat";

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
    <View
      style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 6 }}
    >
      {ctx.slice(0, 3).map((c, i) => (
        <View
          key={i}
          style={{
            paddingHorizontal: 7,
            paddingVertical: 2,
            borderRadius: 8,
            backgroundColor: C.cyan + "18",
            borderWidth: 1,
            borderColor: C.cyan + "33",
          }}
        >
          <Text style={{ fontSize: 9, color: C.cyan }}>
            {c.date} · {c.emotion} · {c.similarity}% match
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function ChatScreen() {
  const { messages, loading, error, send, reset, refresh } = useChat();
  const [input, setInput] = useState("");
  const listRef = useRef<FlatList>(null);
  const { mode } = useLocalSearchParams<{ mode?: string }>();

  // Voice States
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentlySpeaking, setCurrentlySpeaking] = useState<string | null>(null);
  const [autoVoice, setAutoVoice] = useState(true); // Default to true for user's request

  useFocusEffect(
    useCallback(() => {
      refresh();
      return () => {
        Speech.stop();
        if (recordingRef.current) {
          recordingRef.current.stopAndUnloadAsync().catch(console.error);
          recordingRef.current = null;
        }
      };
    }, [refresh])
  );

  const scrollToEnd = () =>
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);

  useEffect(() => {
    scrollToEnd();
    
    // Auto-reply in voice
    if (autoVoice && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'ai' && currentlySpeaking !== lastMsg.id) {
        speakMessage(lastMsg.id, lastMsg.text);
      }
    }
  }, [messages.length, autoVoice]);

  useEffect(() => {
    if (mode === 'panic' && messages.length === 0) {
      handleSend("I'm having a panic attack and need immediate support.");
    }
  }, [mode]);

  // STT Logic
  const lastStartTimeRef = useRef<number>(0);

  async function startRecording() {
    try {
      if (recordingRef.current || isRecording) {
        console.warn('Recording already in progress, stopping old one first...');
        await stopRecording();
      }

      Speech.stop(); 
      setCurrentlySpeaking(null);

      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        console.error('Microphone permission not granted');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Creating new recording object...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = recording;
      lastStartTimeRef.current = Date.now();
      setIsRecording(true);
      console.log('Recording started at', lastStartTimeRef.current);
    } catch (err) {
      console.error('Failed to start recording:', err);
      recordingRef.current = null;
      setIsRecording(false);
    }
  }

  async function stopRecording() {
    if (!recordingRef.current) {
      console.log('Stop recording called but no active recording.');
      setIsRecording(false);
      return;
    }
    
    const duration = Date.now() - lastStartTimeRef.current;
    console.log(`Stopping recording. Duration: ${duration}ms`);

    const recording = recordingRef.current;
    recordingRef.current = null;
    setIsRecording(false);

    // Ignore very short taps (less than 500ms)
    if (duration < 500) {
      console.log('Recording too short, discarding...');
      try {
        await recording.stopAndUnloadAsync();
      } catch (e) {}
      return;
    }

    setIsTranscribing(true);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Recording URI:', uri);
      
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      if (uri) {
        const formData = new FormData();
        
        if (Platform.OS === 'web') {
          // On web, we need to fetch the blob from the URI
          const response = await fetch(uri);
          const blob = await response.blob();
          formData.append('audio', blob, `recording_${Date.now()}.m4a`);
        } else {
          // On native, we use the RN FormData hack
          // @ts-ignore
          formData.append('audio', {
            uri,
            name: `recording_${Date.now()}.m4a`,
            type: 'audio/m4a',
          });
        }

        const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
        console.log('Sending to STT:', `${API_URL}/voice/stt`);
        
        const response = await fetch(`${API_URL}/voice/stt`, {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        console.log('STT Result:', result);
        
        if (result.success && result.text && result.text.length > 1) {
          handleSend(result.text);
        } else {
          console.log('No text transcribed or text too short');
        }
      }
    } catch (err) {
      console.error('STT Error:', err);
    } finally {
      setIsTranscribing(false);
    }
  }

  // TTS Logic - Using Backend Kokoro TTS for better quality
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  async function speakMessage(id: string, text: string) {
    if (currentlySpeaking === id) {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
      Speech.stop();
      setCurrentlySpeaking(null);
      return;
    }

    // Stop current
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    Speech.stop();
    
    setCurrentlySpeaking(id);

    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/voice/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const result = await response.json();
      if (result.success && result.audioUrl) {
        const fullAudioUrl = result.audioUrl.startsWith('http') 
          ? result.audioUrl 
          : `${API_URL}${result.audioUrl}`;
        
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: fullAudioUrl },
          { shouldPlay: true }
        );
        setSound(newSound);
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setCurrentlySpeaking(null);
            newSound.unloadAsync();
          }
        });
      } else {
        // Fallback to Expo Speech
        Speech.speak(text, {
          onDone: () => setCurrentlySpeaking(null),
          onError: () => setCurrentlySpeaking(null),
        });
      }
    } catch (err) {
      console.error('TTS Error:', err);
      // Final Fallback
      Speech.speak(text, {
        onDone: () => setCurrentlySpeaking(null),
        onError: () => setCurrentlySpeaking(null),
      });
    }
  }

  async function handleSend(text: string = input) {
    const t = text.trim();
    if (!t || loading) return;
    setInput("");
    await send(t);
  }

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View style={{ position: "relative" }}>
          <View style={s.avatar}>
            <Text style={{ fontSize: 18 }}>🤖</Text>
          </View>
          <View style={s.dot} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.name}>MindMate AI</Text>
          <Text style={s.sub}>
            ● Online · {messages.length > 0 ? "History synced" : "New session"}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable 
            onPress={() => {
              if (autoVoice) Speech.stop();
              setAutoVoice(!autoVoice);
            }} 
            style={[s.headerBtn, autoVoice && { borderColor: C.neon, backgroundColor: C.neon + '11' }]}
          >
            <Ionicons 
              name={autoVoice ? "volume-high" : "volume-mute-outline"} 
              size={18} 
              color={autoVoice ? C.neon : C.muted} 
            />
          </Pressable>
          <Pressable onPress={reset} style={s.headerBtn}>
            <Text style={{ fontSize: 11, color: C.muted }}>Reset</Text>
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 10 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const isAI = item.role === "ai";
            return (
              <Animated.View
                entering={
                  isAI
                    ? FadeInLeft.delay(100).springify().damping(15)
                    : FadeInRight.delay(100).springify().damping(15)
                }
                style={{
                  flexDirection: "row",
                  justifyContent: isAI ? "flex-start" : "flex-end",
                  marginBottom: 16,
                  paddingHorizontal: 4,
                }}
              >
                {isAI && (
                  <View style={s.msgAvatar}>
                    <Text style={{ fontSize: 14 }}>🤖</Text>
                  </View>
                )}
                <View style={{ maxWidth: "82%" }}>
                  <View style={[s.bubble, isAI ? s.bAI : s.bUser]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Text style={[s.bText, !isAI && { color: "#fff", fontWeight: '500' }, { flex: 1 }]}>
                        {item.text}
                      </Text>
                      {isAI && (
                        <Pressable 
                          onPress={() => speakMessage(item.id, item.text)}
                          style={{ marginLeft: 8, marginTop: 2 }}
                        >
                          <Ionicons 
                            name={currentlySpeaking === item.id ? "volume-high" : "volume-medium-outline"} 
                            size={18} 
                            color={currentlySpeaking === item.id ? C.neon : C.muted} 
                          />
                        </Pressable>
                      )}
                    </View>
                    {isAI && item.context && <ContextBadge ctx={item.context} />}
                  </View>
                  <Text style={[s.timestamp, isAI ? { alignSelf: 'flex-start' } : { alignSelf: 'flex-end' }]}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </Animated.View>
            );
          }}
          ListFooterComponent={
            loading ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  gap: 8,
                  marginBottom: 16,
                  paddingHorizontal: 4,
                }}
              >
                <View style={s.msgAvatar}>
                  <Text style={{ fontSize: 14 }}>🤖</Text>
                </View>
                <View style={[s.bubble, s.bAI, { paddingVertical: 14, width: 60 }]}>
                  <View style={{ flexDirection: "row", gap: 5, justifyContent: 'center' }}>
                    {[0, 1, 2].map((i) => (
                      <Animated.View
                        key={i}
                        entering={FadeInLeft.delay(i * 100).springify()}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: C.neon,
                          opacity: 0.6,
                        }}
                      />
                    ))}
                  </View>
                </View>
              </View>
            ) : messages.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <View style={s.welcomeCircle}>
                  <Text style={{ fontSize: 40 }}>🧘‍♂️</Text>
                </View>
                <Text style={s.welcomeTitle}>How are you feeling, today?</Text>
                <Text style={s.welcomeSub}>I'm here to listen and help you find patterns in your journey.</Text>
                
                <View style={{ width: '100%', marginTop: 30 }}>
                  <Text style={s.ql}>SUGGESTIONS</Text>
                  {QUICK_PROMPTS.map((p, i) => (
                    <Pressable
                      key={i}
                      onPress={() => handleSend(p)}
                      style={({ pressed }) => [s.qbtn, pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }]}
                    >
                      <Text style={s.qtext}>{p}</Text>
                      <Ionicons name="chevron-forward" size={14} color={C.muted} />
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null
          }
        />

        {error ? (
          <View style={s.errBar}>
            <Text style={s.errText}>⚠ {error}</Text>
          </View>
        ) : null}

        <View style={s.inputRow}>
          <Pressable
            onPress={isRecording ? stopRecording : startRecording}
            style={[
              s.micBtn,
              isRecording && { backgroundColor: C.rose + "33", borderColor: C.rose }
            ]}
          >
            {isTranscribing ? (
              <ActivityIndicator size="small" color={C.neon} />
            ) : (
              <Ionicons 
                name={isRecording ? "stop-circle" : "mic-outline"} 
                size={22} 
                color={isRecording ? C.rose : C.muted} 
              />
            )}
          </Pressable>

          <TextInput
            style={[
              s.input,
              input.length > 0 && { borderColor: C.neon + "55" },
            ]}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSend()}
            placeholder={isRecording ? "Listening..." : "Ask MindMate anything..."}
            placeholderTextColor={C.muted}
            returnKeyType="send"
            blurOnSubmit={false}
            multiline
          />
          <Pressable
            onPress={() => handleSend()}
            disabled={loading || !input.trim()}
            style={[
              s.sendBtn,
              (!input.trim() || loading) && { backgroundColor: C.muted + "44" },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="arrow-up" size={24} color="#fff" />
            )}
          </Pressable>
        </View>
        <Text
          style={{
            textAlign: "center",
            fontSize: 9,
            color: C.muted,
            paddingBottom: 8,
          }}
        >
          AI · Private · Responses grounded in your journal sessions
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.void },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: C.a1 + "44",
    borderWidth: 1,
    borderColor: C.neon + "44",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.lime,
    borderWidth: 2,
    borderColor: C.void,
  },
  name: { fontSize: 16, fontWeight: "700", color: C.text },
  sub: { fontSize: 12, color: C.lime },
  headerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: C.lift,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: C.neon + "22",
    borderWidth: 1,
    borderColor: C.neon + "33",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    alignSelf: "flex-end",
  },
  bubble: { 
    borderRadius: 20, 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    elevation: 2, 
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)'
  },
  bAI: {
    backgroundColor: C.lift,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    borderBottomLeftRadius: 4,
  },
  bUser: { backgroundColor: C.a1, borderBottomRightRadius: 4 },
  bText: { fontSize: 15, lineHeight: 22, color: C.text },
  timestamp: { fontSize: 10, color: C.muted, marginTop: 4, marginHorizontal: 4 },
  welcomeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.lift,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },
  welcomeSub: {
    fontSize: 14,
    color: C.sub,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  ql: {
    fontSize: 11,
    color: C.muted,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  qbtn: {
    backgroundColor: C.lift,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtext: { fontSize: 14, color: C.sub, fontWeight: '500' },
  errBar: {
    marginHorizontal: 14,
    marginBottom: 10,
    padding: 12,
    backgroundColor: C.rose + "18",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.rose + "44",
  },
  errText: { fontSize: 13, color: C.rose },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: C.void,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.lift,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    backgroundColor: C.lift,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    color: C.text,
    fontSize: 15,
    maxHeight: 120,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.a1,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    boxShadow: `0px 4px 8px ${C.a1}44`
  },
});
