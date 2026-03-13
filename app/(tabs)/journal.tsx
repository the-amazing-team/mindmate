import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Animated, Modal, KeyboardAvoidingView, Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius } from '@/constants/theme';

const { width } = Dimensions.get('window');

const MOODS = [
  { emoji: '😔', label: 'Awful', color: '#EF4444', score: 1 },
  { emoji: '😟', label: 'Bad', color: '#F97316', score: 2 },
  { emoji: '😐', label: 'Okay', color: '#F59E0B', score: 3 },
  { emoji: '🙂', label: 'Good', color: '#10B981', score: 4 },
  { emoji: '🤩', label: 'Amazing', color: '#8B5CF6', score: 5 },
];

const PROMPTS = [
  "What made you smile today?",
  "Describe one challenge you overcame.",
  "What are you grateful for right now?",
  "How did your body feel today?",
  "What's on your mind that you haven't said out loud?",
  "Write about a moment of peace you experienced.",
];

const SAMPLE_ENTRIES = [
  {
    id: '1',
    title: 'A tough but meaningful day',
    content: 'Today was really challenging, but I managed to push through. I had a difficult conversation with my colleague...',
    mood: 3,
    date: 'Today, 9:41 PM',
    tags: ['work', 'growth'],
  },
  {
    id: '2',
    title: 'Gratitude and small wins',
    content: 'I woke up early, made my coffee just right, and actually sat in the morning light for 10 whole minutes...',
    mood: 5,
    date: 'Yesterday',
    tags: ['gratitude', 'mindfulness'],
  },
  {
    id: '3',
    title: 'Feeling overwhelmed',
    content: 'The to-do list never seems to end. But I reminded myself that progress, not perfection, is the goal...',
    mood: 2,
    date: 'Mar 10',
    tags: ['stress', 'resilience'],
  },
];

function EntryCard({ entry }: { entry: typeof SAMPLE_ENTRIES[0] }) {
  const mood = MOODS[entry.mood - 1];
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity style={styles.entryCard} activeOpacity={0.85}>
        <View style={styles.entryHeader}>
          <View style={styles.entryMoodBadge}>
            <Text>{mood.emoji}</Text>
            <Text style={[styles.entryMoodLabel, { color: mood.color }]}>{mood.label}</Text>
          </View>
          <Text style={styles.entryDate}>{entry.date}</Text>
        </View>
        <Text style={styles.entryTitle}>{entry.title}</Text>
        <Text style={styles.entryPreview} numberOfLines={2}>{entry.content}</Text>
        <View style={styles.entryTags}>
          {entry.tags.map(tag => (
            <View key={tag} style={styles.tagBadge}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function JournalScreen() {
  const [showCompose, setShowCompose] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const prompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

  const FILTERS = ['All', 'This Week', 'This Month', 'Favorites'];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#EC4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>My Journal</Text>
            <Text style={styles.headerSubtitle}>47 entries · 12 day streak 🔥</Text>
          </View>
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => setShowCompose(true)}
          >
            <Text style={styles.newBtnText}>+ New</Text>
          </TouchableOpacity>
        </View>

        {/* Writing Prompt */}
        <View style={styles.promptBox}>
          <Text style={styles.promptIcon}>✨</Text>
          <Text style={styles.promptText}>"{prompt}"</Text>
        </View>
      </LinearGradient>

      {/* Filter Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, activeFilter === f && styles.filterBtnActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Entries List */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {SAMPLE_ENTRIES.map(entry => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Compose Modal */}
      <Modal visible={showCompose} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.composeModal}>
            <View style={styles.composeHandle} />

            <View style={styles.composeHeader}>
              <Text style={styles.composeTitle}>New Entry</Text>
              <TouchableOpacity onPress={() => setShowCompose(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Mood Selector */}
            <Text style={styles.composeMoodLabel}>How are you feeling?</Text>
            <View style={styles.moodRow}>
              {MOODS.map((m, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelectedMood(i)}
                  style={[
                    styles.moodBtn,
                    selectedMood === i && { borderColor: m.color, borderWidth: 2, backgroundColor: m.color + '20' },
                  ]}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  <Text style={[styles.moodLabel, { color: m.color }]}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.titleInput}
              placeholder="Entry title..."
              placeholderTextColor={Colors.dark.textMuted}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.contentInput}
              placeholder="Write your thoughts here..."
              placeholderTextColor={Colors.dark.textMuted}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />

            {/* Template Picker */}
            <View style={styles.templateRow}>
              <Text style={styles.templateLabel}>Templates:</Text>
              {['Daily Check-in', 'Gratitude', 'Dream Log'].map(t => (
                <TouchableOpacity key={t} style={styles.templateChip}>
                  <Text style={styles.templateChipText}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={() => setShowCompose(false)}>
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveBtnGradient}
              >
                <Text style={styles.saveBtnText}>Save Entry ✓</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.dark.bg },

  header: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  newBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  newBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  promptBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  promptIcon: { fontSize: 18 },
  promptText: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontStyle: 'italic', flex: 1, lineHeight: 20 },

  filterBar: { maxHeight: 56 },
  filterContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  filterBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: { fontSize: 13, color: Colors.dark.textSecondary, fontWeight: '500' },
  filterTextActive: { color: '#fff', fontWeight: '700' },

  list: { padding: Spacing.md, gap: Spacing.sm },

  entryCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: Spacing.sm,
  },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  entryMoodBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  entryMoodLabel: { fontSize: 12, fontWeight: '600' },
  entryDate: { fontSize: 12, color: Colors.dark.textMuted },
  entryTitle: { fontSize: 16, fontWeight: '700', color: Colors.dark.text, marginBottom: 6 },
  entryPreview: { fontSize: 13, color: Colors.dark.textSecondary, lineHeight: 20, marginBottom: 10 },
  entryTags: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tagBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  tagText: { fontSize: 11, color: Colors.primaryLight, fontWeight: '600' },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  composeModal: {
    backgroundColor: Colors.dark.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.md,
    maxHeight: '90%',
  },
  composeHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.dark.muted,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  composeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  composeTitle: { fontSize: 20, fontWeight: '700', color: Colors.dark.text },
  closeBtn: { fontSize: 18, color: Colors.dark.textSecondary, padding: 4 },
  composeMoodLabel: { fontSize: 14, color: Colors.dark.textSecondary, marginBottom: Spacing.sm },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  moodBtn: {
    alignItems: 'center',
    padding: 8,
    borderRadius: Radius.md,
    flex: 1,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  moodEmoji: { fontSize: 22, marginBottom: 4 },
  moodLabel: { fontSize: 10, fontWeight: '600' },

  titleInput: {
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  contentInput: {
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.dark.text,
    fontSize: 14,
    height: 140,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    lineHeight: 22,
  },
  templateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md, flexWrap: 'wrap' },
  templateLabel: { fontSize: 12, color: Colors.dark.textMuted },
  templateChip: {
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  templateChipText: { fontSize: 12, color: Colors.dark.textSecondary },

  saveBtn: { borderRadius: Radius.md, overflow: 'hidden' },
  saveBtnGradient: { padding: Spacing.md, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
