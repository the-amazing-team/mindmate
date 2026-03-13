import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, Dimensions, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius } from '@/constants/theme';

const { width } = Dimensions.get('window');

const WEEK_DATA = [
  { day: 'Mon', score: 3.2, mood: '😐' },
  { day: 'Tue', score: 4.1, mood: '🙂' },
  { day: 'Wed', score: 2.8, mood: '😟' },
  { day: 'Thu', score: 4.5, mood: '😊' },
  { day: 'Fri', score: 3.8, mood: '🙂' },
  { day: 'Sat', score: 5.0, mood: '🤩' },
  { day: 'Sun', score: 4.6, mood: '😊' },
];

const EMOTION_DATA = [
  { label: 'Calm', value: 68, color: '#10B981' },
  { label: 'Anxious', value: 42, color: '#F97316' },
  { label: 'Happy', value: 75, color: '#8B5CF6' },
  { label: 'Sad', value: 28, color: '#06B6D4' },
  { label: 'Focused', value: 55, color: '#F59E0B' },
];

const INSIGHTS = [
  {
    emoji: '🌙',
    title: 'Sleep affects your mood',
    desc: 'On days you journal after 10 PM, your mood score drops by 1.4 points on average.',
    color: '#8B5CF6',
  },
  {
    emoji: '☀️',
    title: 'Morning journaling boosts you',
    desc: 'Your best mood days correlate with morning journal entries. 73% accuracy.',
    color: '#F59E0B',
  },
  {
    emoji: '💼',
    title: 'Work stress peaks on Wednesdays',
    desc: 'Wednesday entries contain stress-related words 3x more than other days.',
    color: '#EF4444',
  },
  {
    emoji: '🧘',
    title: 'Mindfulness sessions help',
    desc: 'After noting mindfulness activities, your next-day mood improves by 0.8 points.',
    color: '#10B981',
  },
];

function AnimatedBar({ value, color, maxValue = 5 }: { value: number; color: string; maxValue?: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const barHeight = 80;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: value / maxValue,
      tension: 60,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        height: anim.interpolate({ inputRange: [0, 1], outputRange: [4, barHeight] }),
        backgroundColor: color,
        borderRadius: 6,
        width: '100%',
        minHeight: 4,
      }}
    />
  );
}

function EmotionBar({ label, value, color }: { label: string; value: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: value / 100,
      tension: 50,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <View style={styles.emotionRow}>
      <Text style={styles.emotionLabel}>{label}</Text>
      <View style={styles.emotionTrack}>
        <Animated.View
          style={[
            styles.emotionFill,
            {
              width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              backgroundColor: color,
            },
          ]}
        />
      </View>
      <Text style={[styles.emotionValue, { color }]}>{value}%</Text>
    </View>
  );
}

export default function InsightsScreen() {
  const [activePeriod, setActivePeriod] = useState('Week');
  const PERIODS = ['Week', 'Month', '3 Months', 'Year'];
  const maxScore = Math.max(...WEEK_DATA.map(d => d.score));

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient
        colors={['#06B6D4', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Insights Dashboard</Text>
        <Text style={styles.headerSubtitle}>Your emotional intelligence, visualized</Text>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          {[
            { icon: '📈', label: 'Avg Mood', value: '3.9/5' },
            { icon: '✍️', label: 'Entries', value: '47' },
            { icon: '🔥', label: 'Streak', value: '12d' },
            { icon: '🏆', label: 'Best Day', value: 'Sat' },
          ].map((s, i) => (
            <View key={i} style={styles.summaryCard}>
              <Text style={styles.summaryIcon}>{s.icon}</Text>
              <Text style={styles.summaryValue}>{s.value}</Text>
              <Text style={styles.summaryLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Period Selector */}
        <View style={styles.periodRow}>
          {PERIODS.map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, activePeriod === p && styles.periodBtnActive]}
              onPress={() => setActivePeriod(p)}
            >
              <Text style={[styles.periodText, activePeriod === p && styles.periodTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mood Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mood Trend</Text>
          <View style={styles.chartContainer}>
            <View style={styles.chart}>
              {WEEK_DATA.map((d, i) => (
                <View key={i} style={styles.chartColumn}>
                  <Text style={styles.chartEmoji}>{d.mood}</Text>
                  <View style={styles.barWrapper}>
                    <AnimatedBar
                      value={d.score}
                      maxValue={5}
                      color={d.score >= 4 ? Colors.success : d.score >= 3 ? Colors.secondary : Colors.warning}
                    />
                  </View>
                  <Text style={styles.chartScore}>{d.score.toFixed(1)}</Text>
                  <Text style={styles.chartDay}>{d.day}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Emotion Distribution */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Emotion Distribution</Text>
          <Text style={styles.cardSubtitle}>This {activePeriod.toLowerCase()}</Text>
          <View style={styles.emotionList}>
            {EMOTION_DATA.map(e => (
              <EmotionBar key={e.label} label={e.label} value={e.value} color={e.color} />
            ))}
          </View>
        </View>

        {/* AI Insights */}
        <Text style={styles.sectionTitle}>AI Insights ✨</Text>
        {INSIGHTS.map((insight, i) => (
          <TouchableOpacity key={i} style={styles.insightCard} activeOpacity={0.85}>
            <View style={[styles.insightIcon, { backgroundColor: insight.color + '20' }]}>
              <Text style={{ fontSize: 22 }}>{insight.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightDesc}>{insight.desc}</Text>
            </View>
            <Text style={{ color: Colors.dark.textMuted }}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Heatmap placeholder */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Activity Heatmap</Text>
          <Text style={styles.cardSubtitle}>Journal entries this month</Text>
          <View style={styles.heatmap}>
            {Array.from({ length: 28 }).map((_, i) => {
              const intensity = Math.random();
              return (
                <View
                  key={i}
                  style={[
                    styles.heatCell,
                    {
                      backgroundColor:
                        intensity > 0.7
                          ? Colors.primary
                          : intensity > 0.4
                          ? Colors.primary + '60'
                          : intensity > 0.1
                          ? Colors.primary + '25'
                          : Colors.dark.border,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.dark.bg },
  scroll: { paddingBottom: 24 },

  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 4 },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: Spacing.lg },
  summaryRow: { flexDirection: 'row', gap: Spacing.sm },
  summaryCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  summaryIcon: { fontSize: 18, marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: '800', color: '#fff' },
  summaryLabel: { fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  periodRow: {
    flexDirection: 'row',
    margin: Spacing.md,
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.md,
    padding: 4,
    gap: 2,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  periodBtnActive: { backgroundColor: Colors.primary },
  periodText: { fontSize: 12, color: Colors.dark.textSecondary, fontWeight: '600' },
  periodTextActive: { color: '#fff' },

  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.lg,
    margin: Spacing.md,
    marginTop: 0,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.dark.text, marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: Colors.dark.textMuted, marginBottom: Spacing.md },

  chartContainer: { overflow: 'hidden' },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 130,
    paddingTop: 16,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  chartEmoji: { fontSize: 14 },
  barWrapper: {
    width: '60%',
    flex: 1,
    justifyContent: 'flex-end',
  },
  chartScore: { fontSize: 9, color: Colors.dark.textSecondary, fontWeight: '600' },
  chartDay: { fontSize: 10, color: Colors.dark.textMuted },

  emotionList: { gap: Spacing.sm, marginTop: 4 },
  emotionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  emotionLabel: { width: 60, fontSize: 13, color: Colors.dark.textSecondary, fontWeight: '500' },
  emotionTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.dark.muted,
    borderRadius: 4,
    overflow: 'hidden',
  },
  emotionFill: { height: '100%', borderRadius: 4 },
  emotionValue: { width: 38, fontSize: 12, fontWeight: '700', textAlign: 'right' },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.dark.card,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  insightTitle: { fontSize: 14, fontWeight: '700', color: Colors.dark.text, marginBottom: 4 },
  insightDesc: { fontSize: 12, color: Colors.dark.textSecondary, lineHeight: 18 },

  heatmap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 4,
  },
  heatCell: {
    width: (width - Spacing.md * 4 - 5 * 6) / 7,
    height: (width - Spacing.md * 4 - 5 * 6) / 7,
    borderRadius: 4,
  },
});
