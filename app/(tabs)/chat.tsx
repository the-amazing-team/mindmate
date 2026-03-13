import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Animated, KeyboardAvoidingView, Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius } from '@/constants/theme';

const { width } = Dimensions.get('window');

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    text: "Hi! I'm MindMate AI 🧠 I've read your recent journal entries. How are you feeling today?",
    time: '9:41 PM',
  },
  {
    id: '2',
    role: 'user',
    text: "I've been feeling overwhelmed lately with work stuff.",
    time: '9:42 PM',
  },
  {
    id: '3',
    role: 'assistant',
    text: "I noticed from your journals that work stress has been recurring. That's completely valid. 💙\n\nWould you like to:\n• Explore a calming breathing exercise\n• Unpack what's triggering the overwhelm\n• Look at your mood patterns over the past week",
    time: '9:42 PM',
  },
];

const QUICK_REPLIES = [
  "Breathing exercise 🌬️",
  "What triggers my stress?",
  "Show my mood trends",
  "I need to vent",
];

const AI_RESPONSES = [
  "That sounds really tough. Let's take a moment together. Try box breathing: inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Ready? 🌬️",
  "Based on your journals, your stress spikes on Monday evenings and before major deadlines. Does that match how you feel? 📊",
  "Your mood score improved 2.3 points over the past two weeks! You've been resilient through a lot. 🌟",
  "I'm here. Take your time. Everything you share stays private and safe. 💙",
  "That's a really insightful observation. Your journals show you've handled similar situations before — you're stronger than you think.",
];

type Message = { id: string; role: 'user' | 'assistant'; text: string; time: string; typing?: boolean };

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      ).start();
    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  return (
    <View style={styles.typingBubble}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View
          key={i}
          style={[styles.typingDot, { transform: [{ translateY: dot }] }]}
        />
      ))}
    </View>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(isUser ? 30 : -30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.msgRow,
        isUser ? styles.msgRowUser : styles.msgRowAI,
        { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
      ]}
    >
      {!isUser && (
        <View style={styles.aiAvatar}>
          <Text style={styles.aiAvatarEmoji}>🧠</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
        {msg.typing ? (
          <TypingIndicator />
        ) : (
          <>
            <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAI]}>
              {msg.text}
            </Text>
            <Text style={[styles.bubbleTime, isUser ? styles.bubbleTimeUser : styles.bubbleTimeAI]}>
              {msg.time}
            </Text>
          </>
        )}
      </View>
    </Animated.View>
  );
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      time: now,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1800);
  };

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, isTyping]);

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient
        colors={['#10B981', '#06B6D4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.aiInfo}>
            <View style={styles.aiAvatarLarge}>
              <Text style={{ fontSize: 26 }}>🧠</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>MindMate AI</Text>
              <View style={styles.onlineRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Online · Reads your journals</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.insightBtn}>
            <Text style={styles.insightBtnText}>📊</Text>
          </TouchableOpacity>
        </View>

        {/* Context Bar */}
        <View style={styles.contextBar}>
          <Text style={styles.contextLabel}>Journal context:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['Work stress', 'Sleep issues', 'Gratitude', 'Anxiety'].map(t => (
              <View key={t} style={styles.contextChip}>
                <Text style={styles.contextChipText}>{t}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </LinearGradient>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dateLabel}>
          <Text style={styles.dateLabelText}>Today</Text>
        </View>
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {isTyping && (
          <View style={[styles.msgRow, styles.msgRowAI]}>
            <View style={styles.aiAvatar}>
              <Text style={styles.aiAvatarEmoji}>🧠</Text>
            </View>
            <TypingIndicator />
          </View>
        )}
        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Quick Replies */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickBar}
        contentContainerStyle={styles.quickContent}
      >
        {QUICK_REPLIES.map(q => (
          <TouchableOpacity
            key={q}
            style={styles.quickChip}
            onPress={() => sendMessage(q)}
          >
            <Text style={styles.quickChipText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn}>
            <Text style={styles.attachIcon}>📎</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Share what's on your mind..."
            placeholderTextColor={Colors.dark.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim()}
          >
            <LinearGradient
              colors={['#10B981', '#06B6D4']}
              style={styles.sendBtnGradient}
            >
              <Text style={styles.sendIcon}>↑</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.dark.bg },

  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  aiInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiAvatarLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  onlineText: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  insightBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightBtnText: { fontSize: 20 },

  contextBar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contextLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', flexShrink: 0 },
  contextChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginRight: 6,
  },
  contextChipText: { fontSize: 11, color: '#fff', fontWeight: '600' },

  messages: { flex: 1 },
  messagesContent: { padding: Spacing.md },
  dateLabel: { alignItems: 'center', marginBottom: Spacing.md },
  dateLabelText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },

  msgRow: { flexDirection: 'row', marginBottom: Spacing.sm, alignItems: 'flex-end', gap: 8 },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowAI: { justifyContent: 'flex-start' },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    flexShrink: 0,
  },
  aiAvatarEmoji: { fontSize: 16 },

  bubble: {
    maxWidth: width * 0.72,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: Colors.dark.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  bubbleText: { fontSize: 14, lineHeight: 22 },
  bubbleTextUser: { color: '#fff' },
  bubbleTextAI: { color: Colors.dark.text },
  bubbleTime: { fontSize: 10, marginTop: 6 },
  bubbleTimeUser: { color: 'rgba(255,255,255,0.6)', textAlign: 'right' },
  bubbleTimeAI: { color: Colors.dark.textMuted },

  typingBubble: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    padding: 14,
    borderRadius: Radius.lg,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
  },

  quickBar: { maxHeight: 48 },
  quickContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickChip: {
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  quickChipText: { fontSize: 12, color: Colors.dark.textSecondary, fontWeight: '500' },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 28 : Spacing.md,
    gap: 10,
    backgroundColor: Colors.dark.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  attachBtn: { padding: 8 },
  attachIcon: { fontSize: 20 },
  input: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: Colors.dark.text,
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  sendBtn: { borderRadius: 22, overflow: 'hidden' },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: { color: '#fff', fontSize: 20, fontWeight: '800' },
});
