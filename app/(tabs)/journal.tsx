import { C } from '@/constants/theme';
import { JournalEntry, JournalSection, useJournal } from '@/hooks/use-journal';
import { useCallback, useState, useEffect } from 'react';
import { useInsights } from '@/hooks/use-insights';
import { Insight } from '@/services/insight.service';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenView = 'list' | 'write' | 'detail';

/* ───────────────── Helpers ───────────────── */

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();

  if (d.toDateString() === now.toDateString()) {
    return (
      'Today, ' +
      d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })
    );
  }

  const y = new Date(now);
  y.setDate(now.getDate() - 1);

  if (d.toDateString() === y.toDateString()) {
    return (
      'Yesterday, ' +
      d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })
    );
  }

  return d.toLocaleDateString('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function EmotionBadge({
  emotion,
  score,
}: {
  emotion: string | null | undefined;
  score: number | null | undefined;
}) {
  if (!emotion) return null;

  const intensity = score ? Math.round(score * 100) : null;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 }}>
      <View
        style={{
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 12,
          backgroundColor: C.cyan + '20',
          borderWidth: 1,
          borderColor: C.cyan + '44',
        }}
      >
        <Text style={{ fontSize: 10, color: C.cyan, fontWeight: '700' }}>
          {emotion}
          {intensity ? ` · ${intensity}%` : ''}
        </Text>
      </View>
    </View>
  );
}

function TagChip({ label }: { label: string }) {
  return (
    <View
      style={{
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: 20,
        backgroundColor: C.neon + '18',
        borderWidth: 1,
        borderColor: C.neon + '33',
      }}
    >
      <Text style={{ fontSize: 10, color: C.neon, fontWeight: '600' }}>
        {label}
      </Text>
    </View>
  );
}

/* ───────────────── Detail View ───────────────── */


function DetailView({
  entry,
  onBack,
}: {
  entry: JournalEntry;
  onBack: () => void;
}) {
  const { getEntryInsight } = useInsights();
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    async function load() {
      setLoadingInsight(true);
      const res = await getEntryInsight(entry.id);
      setInsight(res);
      setLoadingInsight(false);
    }
    load();
  }, [entry.id]);

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Animated.View entering={FadeIn.springify()}>
        <Pressable onPress={onBack} style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, color: C.sub }}>← Journal</Text>
        </Pressable>

        <Text
          style={{
            fontSize: 20,
            fontWeight: '800',
            color: C.text,
            marginBottom: 4,
          }}
        >
          {entry.title || 'Untitled'}
        </Text>

        <Text style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>
          {formatDate(entry.created_at)}
        </Text>

        {/* Entry Insight Card */}
        {insight && (
          <View style={[s.card, { marginBottom: 24, backgroundColor: C.a1 + '10', borderColor: C.neon + '33' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Text style={{ fontSize: 16 }}>✨</Text>
              <Text style={{ fontSize: 10, fontWeight: '700', color: C.neon, letterSpacing: 1 }}>ENTRY INSIGHT</Text>
            </View>

            <Text style={{ fontSize: 14, color: C.text, lineHeight: 22, marginBottom: 12 }}>
              {insight.summary}
            </Text>
            <View style={{ backgroundColor: C.void, borderRadius: 12, padding: 12, borderLeftWidth: 3, borderLeftColor: C.neon }}>
              <Text style={{ fontSize: 12, color: C.sub, lineHeight: 18, fontStyle: 'italic' }}>
                "{insight.recommendation}"
              </Text>
            </View>
          </View>
        )}

        {entry.sections?.map((sec: JournalSection) => (
          <View key={sec.id} style={s.sectionCard}>
            <Text
              style={{
                fontSize: 14,
                color: C.text,
                lineHeight: 24,
                marginBottom: 10,
              }}
            >
              {sec.content}
            </Text>

            <EmotionBadge
              emotion={sec.primary_emotion}
              score={sec.emotion_score}
            />

            {sec.reflection_text && (
              <View style={s.reflectionBox}>
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: '700',
                    color: C.neon,
                    letterSpacing: 1,
                    marginBottom: 6,
                  }}
                >
                  AI REFLECTION
                </Text>

                <Text
                  style={{
                    fontSize: 13,
                    color: C.sub,
                    lineHeight: 20,
                    fontStyle: 'italic',
                  }}
                >
                  "{sec.reflection_text}"
                </Text>
              </View>
            )}
          </View>
        ))}
      </Animated.View>
    </ScrollView>
  );
}

/* ───────────────── Write View ───────────────── */

function WriteView({
  onBack,
  onSave,
  createEntry,
  processSection,
}: {
  onBack: () => void;
  onSave: () => void;
  createEntry: (data: any) => Promise<{ data: any; error: any }>;
  processSection: (content: string) => Promise<{ data: any; error: any }>;
}) {
  const [title, setTitle] = useState('');
  const [sections, setSections] = useState<
    Array<{
      content: string;
      reflection?: string;
      primary_emotion?: string;
      emotion_score?: number;
    }>
  >([{ content: '' }]);
  const [mood, setMood] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [saveErr, setSaveErr] = useState('');
  const [processingIdx, setProcessingIdx] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function updateSection(idx: number, val: string) {
    setSections((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, content: val } : s))
    );
  }

  async function addSection() {
    const lastIdx = sections.length - 1;
    const lastSection = sections[lastIdx];

    if (!lastSection.content.trim()) return;

    setProcessingIdx(lastIdx);
    const { data, error } = await processSection(lastSection.content);
    setProcessingIdx(null);

    if (error) {
      setSaveErr(error);
      return;
    }

    // Update last section with AI data and add a new one
    setSections((prev) => {
      const next = [...prev];
      next[lastIdx] = {
        ...next[lastIdx],
        reflection: data.reflection_text,
        primary_emotion: data.primary_emotion,
        emotion_score: data.emotion_score,
      };
      next.push({ content: '' });
      return next;
    });
  }

  async function handleSave() {
    if (isSaving) return;
    const filled = sections.filter((s) => s.content.trim().length > 0);
    if (!filled.length) return;

    setIsSaving(true);
    setSaveErr('');

    const { error } = await createEntry({
      title: title.trim() || null,
      overall_mood: mood !== null ? `${mood}` : null,
      sections: filled.map((s, idx) => ({
        content: s.content,
        section_order: idx,
        // The backend might not support these yet in create, but good to have if it does
        primary_emotion: s.primary_emotion,
        emotion_score: s.emotion_score,
        reflection_text: s.reflection,
      })),
    });

    if (error) {
      setSaveErr(error);
      setIsSaving(false);
      return;
    }

    setDone(true);
    setTimeout(onSave, 900);
  }

  if (done)
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: C.void,
        }}
      >
        <Text style={{ fontSize: 48, marginBottom: 16 }}>✦</Text>
        <Text
          style={{
            fontSize: 22,
            fontWeight: '800',
            color: C.text,
            marginBottom: 8,
          }}
        >
          Entry saved!
        </Text>
        <Text style={{ fontSize: 13, color: C.sub }}>
          AI reflections arriving shortly...
        </Text>
        <ActivityIndicator color={C.neon} style={{ marginTop: 20 }} />
      </View>
    );

  return (
    <ScrollView 
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable onPress={onBack} style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 14, color: C.sub }}>← Cancel</Text>
      </Pressable>

      <TextInput
        style={s.titleInput}
        value={title}
        onChangeText={setTitle}
        placeholder="Entry title (optional)"
        placeholderTextColor={C.muted}
      />

      {/* Mood Selector */}
      <View style={{ marginBottom: 24 }}>
        <Text style={s.label}>HOW ARE YOU FEELING?</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          {[
            { e: '😞', v: 1 },
            { e: '😔', v: 2 },
            { e: '😐', v: 3 },
            { e: '🙂', v: 4 },
            { e: '😊', v: 5 },
          ].map((m) => (
            <Pressable
              key={m.v}
              onPress={() => setMood(m.v)}
              style={[
                s.moodBtn,
                mood === m.v && { backgroundColor: C.a1 + '33', borderColor: C.neon }
              ]}
            >
              <Text style={{ fontSize: 24 }}>{m.e}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Sections */}
      <View style={{ marginBottom: 16 }}>
        <Text style={s.label}>JOURNAL CONTENT</Text>

        {sections.map((sec, i) => {
          const isProcessing = processingIdx === i;
          const isLast = i === sections.length - 1;

          return (
            <View key={i} style={{ marginBottom: 16 }}>
              <TextInput
                style={[
                  s.textarea,
                  !isLast && { backgroundColor: C.void, borderColor: 'transparent' },
                ]}
                value={sec.content}
                onChangeText={(val) => updateSection(i, val)}
                placeholder="Write freely..."
                placeholderTextColor={C.muted}
                multiline
                editable={isLast && !isProcessing}
              />

              {isProcessing && (
                <View style={[s.reflectionBox, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
                  <ActivityIndicator size="small" color={C.neon} />
                  <Text style={{ color: C.sub, fontSize: 13 }}>Processing insights...</Text>
                </View>
              )}

              {sec.reflection && !isProcessing && (
                <View style={s.reflectionBox}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={{ fontSize: 9, fontWeight: '700', color: C.neon, letterSpacing: 1 }}>AI REFLECTION</Text>
                    {sec.primary_emotion && (
                      <EmotionBadge emotion={sec.primary_emotion} score={sec.emotion_score} />
                    )}
                  </View>
                  <Text style={{ fontSize: 13, color: C.sub, lineHeight: 20, fontStyle: 'italic' }}>
                    "{sec.reflection}"
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        {processingIdx === null && (
          <Pressable onPress={addSection} style={s.addSection}>
            <Text style={{ fontSize: 12, color: C.neon }}>
              + Add another section
            </Text>
          </Pressable>
        )}
      </View>

      {saveErr ? (
        <Text style={{ color: C.rose, marginBottom: 10 }}>⚠ {saveErr}</Text>
      ) : null}

      <Pressable
        onPress={handleSave}
        disabled={processingIdx !== null || isSaving}
        style={[s.saveBtn, (processingIdx !== null || isSaving) && { opacity: 0.5 }]}
      >
        <Text style={s.saveBtnText}>{isSaving ? 'Saving...' : 'Save Entry'}</Text>
      </Pressable>
    </ScrollView>
  );
}

/* ───────────────── Main Screen ───────────────── */

export default function JournalScreen() {
  const { entries, loading, createEntry, refresh, processSection } = useJournal();

  const [view, setView] = useState<ScreenView>('list');
  const [selected, setSelected] = useState<JournalEntry | null>(null);

  if (view === 'detail' && selected) {
    // Refresh detailed view with live data if needed
    const live = entries.find((e: JournalEntry) => e.id === selected.id) || selected;

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.void }}>
        <DetailView
          entry={live}
          onBack={() => {
            setView('list');
            setSelected(null);
          }}
        />
      </SafeAreaView>
    );
  }

  if (view === 'write')
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.void }}>
        <WriteView
          onBack={() => setView('list')}
          onSave={() => {
            setView('list');
            refresh();
          }}
          createEntry={createEntry}
          processSection={processSection}
        />
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.void }}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Journal ✦</Text>
          <Text style={{ fontSize: 11, color: C.muted }}>
            {loading ? 'Loading...' : `${entries.length} entries`}
          </Text>
        </View>

        <Pressable style={s.newBtn} onPress={() => setView('write')}>
          <Text style={s.newBtnText}>+ New</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={C.neon} />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(e: JournalEntry) => e.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item, index }) => {
            const firstSection = item.sections?.[0];

            return (
              <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
                <Pressable
                  style={s.card}
                  onPress={() => {
                    setSelected(item);
                    setView('detail');
                  }}
                >
                  <Text style={{ fontWeight: '700', color: C.text }}>
                    {item.title || 'Untitled'}
                  </Text>

                  <Text
                    numberOfLines={2}
                    style={{ fontSize: 12, color: C.sub }}
                  >
                    {firstSection?.content ?? ''}
                  </Text>

                  <EmotionBadge
                    emotion={firstSection?.primary_emotion ?? null}
                    score={firstSection?.emotion_score ?? null}
                  />
                </Pressable>
              </Animated.View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

/* ───────────────── Styles ───────────────── */

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },

  title: { fontSize: 22, fontWeight: '800', color: C.text },

  newBtn: {
    backgroundColor: C.a1,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 12,
  },

  newBtnText: { color: C.text, fontSize: 13, fontWeight: '700' },

  card: {
    backgroundColor: C.lift,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    marginBottom: 10,
  },

  sectionCard: {
    backgroundColor: C.lift,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },

  reflectionBox: {
    marginTop: 12,
    backgroundColor: C.a1 + '12',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: C.neon + '22',
  },

  label: {
    fontSize: 10,
    fontWeight: '700',
    color: C.sub,
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  titleInput: {
    backgroundColor: C.lift,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 20,
  },

  textarea: {
    backgroundColor: C.lift,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 14,
    color: C.text,
    fontSize: 14,
    lineHeight: 22,
    minHeight: 120,
  },

  addSection: {
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.neon + '44',
    borderStyle: 'dashed',
  },

  saveBtn: {
    backgroundColor: C.a1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },

  saveBtnText: { color: C.text, fontSize: 15, fontWeight: '700' },
  moodBtn: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: C.lift,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});