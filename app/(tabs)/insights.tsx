import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { C } from '@/constants/theme';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

const EMOTION_COLORS: Record<string, string> = {
  anxious: '#FB7185',  hopeful: '#A3E635',  frustrated: '#FB923C',
  content: '#22D3EE',  sad: '#60A5FA',      excited: '#FBBF24',
  neutral: '#94A3C8',  angry: '#F472B6',
};

function emotionColor(e: string | null) {
  return EMOTION_COLORS[e?.toLowerCase() ?? ''] ?? C.neon;
}

import { useInsights } from '@/hooks/use-insights';
import { Insight } from '@/services/insight.service';
import { authService } from '@/services/auth.service';
import { apiClient } from '@/services/api-client';

export default function InsightsScreen() {
  const { insights, loading, error, refresh } = useInsights();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const totalInsights = insights.length;
  const latestInsight = insights[0];

  async function handleCheckIn(score: number) {
    const user = await authService.getCurrentUser();
    if (!user) return;
    try {
      await apiClient.post('/users/check-in', { userId: user.id, moodScore: score });
      Alert.alert("Success", "Check-in recorded! Your patterns are being updated.");
      refresh();
    } catch (e) {
      console.error("Check-in failed", e);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Insights ◈</Text>
          <Text style={{ fontSize: 11, color: C.muted }}>AI pattern recognition</Text>
        </View>
        <Pressable onPress={refresh} style={s.refreshBtn}>
          <Text style={{ fontSize: 11, color: C.neon }}>↻ Refresh</Text>
        </Pressable>
      </View>

      {loading && insights.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={C.neon} />
          <Text style={{ fontSize: 12, color: C.muted, marginTop: 10 }}>Analyzing your mind...</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 40, marginBottom: 14 }}>⚠️</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 8 }}>Analysis Interrupted</Text>
          <Text style={{ fontSize: 13, color: C.sub, textAlign: 'center', lineHeight: 20, marginBottom: 20 }}>
            {error}
          </Text>
          <Pressable onPress={refresh} style={s.refreshBtn}>
            <Text style={{ color: C.neon }}>Try Again</Text>
          </Pressable>
        </View>
      ) : totalInsights === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <View style={s.emptyIconCircle}>
            <Text style={{ fontSize: 40 }}>🧠</Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: '800', color: C.text, marginBottom: 8 }}>Awaiting Data</Text>
          <Text style={{ fontSize: 14, color: C.sub, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 }}>
            Start your journey by adding a journal entry. Our AI needs your reflections to find patterns and give recommendations.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          
          {/* Quick Check-in */}
          <Animated.View entering={FadeInDown.delay(20).springify()} style={s.card}>
            <Text style={s.sectionLabel}>QUICK CHECK-IN</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              {[
                { e: '😞', v: 1, l: 'Low' },
                { e: '😐', v: 3, l: 'Neutral' },
                { e: '😊', v: 5, l: 'Great' },
              ].map((m) => (
                <Pressable
                  key={m.v}
                  onPress={() => handleCheckIn(m.v)}
                  style={({ pressed }) => [
                    s.moodBtn,
                    pressed && { backgroundColor: C.a1 + '33' }
                  ]}
                >
                  <Text style={{ fontSize: 24, marginBottom: 4 }}>{m.e}</Text>
                  <Text style={{ fontSize: 9, color: C.sub, fontWeight: '700' }}>{m.l}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Stats Card */}
          <Animated.View entering={FadeInDown.delay(40).springify()} style={s.card}>
            <Text style={s.sectionLabel}>OVERVIEW</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ color: C.text, fontSize: 24, fontWeight: '800' }}>{totalInsights}</Text>
                <Text style={{ color: C.muted, fontSize: 10 }}>TOTAL INSIGHTS</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                 <Text style={{ color: C.neon, fontSize: 12, fontWeight: '700' }}>ACTIVE ANALYSIS</Text>
                 <Text style={{ color: C.sub, fontSize: 10 }}>Updated just now</Text>
              </View>
            </View>
          </Animated.View>

          {/* Insights List */}
          <Text style={[s.sectionLabel, { marginLeft: 4, marginBottom: 10 }]}>COLLECTIVE JOURNEYS</Text>
          {insights.map((insight: Insight, idx) => (
            <Animated.View 
              key={insight.id} 
              entering={FadeInDown.delay(100 + idx * 50).springify()}
              style={[s.card, idx === 0 && { borderColor: C.neon + '44', backgroundColor: C.lift + 'AA' }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Text style={{ fontSize: 14 }}>{idx === 0 ? '✨' : '◈'}</Text>
                <Text style={{ fontSize: 9, fontWeight: '700', color: idx === 0 ? C.neon : C.sub, letterSpacing: 1 }}>
                  {new Date(insight.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                </Text>
              </View>

              <Text style={{ fontSize: 14, color: C.text, lineHeight: 22, marginBottom: 12 }}>
                {insight.summary}
              </Text>

              <View style={{ backgroundColor: C.a1 + '15', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.neon + '22' }}>
                <Text style={{ fontSize: 9, fontWeight: '700', color: C.neon, marginBottom: 6, letterSpacing: 0.5 }}>
                  RECOMMENDATION
                </Text>
                <Text style={{ fontSize: 13, color: C.sub, lineHeight: 20 }}>
                  {insight.recommendation}
                </Text>
              </View>
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: C.void },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                  paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10 },
  title:        { fontSize: 22, fontWeight: '800', color: C.text },
  refreshBtn:   { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
                  borderWidth: 1, borderColor: C.neon + '44' },
  kpiRow:       { flexDirection: 'row', gap: 10, marginBottom: 14 },
  kpiCard:      { flex: 1, backgroundColor: C.lift, borderRadius: 16, padding: 14,
                  alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  kpiVal:       { fontSize: 20, fontWeight: '800', lineHeight: 24 },
  kpiLabel:     { fontSize: 9, color: C.muted, marginTop: 3, fontWeight: '700', letterSpacing: 0.6 },
  card:         { backgroundColor: C.lift, borderRadius: 18, padding: 16, borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.07)', marginBottom: 14 },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: C.sub, letterSpacing: 1.2, marginBottom: 12 },
  moodBtn:      { flex: 1, backgroundColor: C.void, borderRadius: 14, padding: 12, marginHorizontal: 4,
                  alignItems: 'center', borderWidth: 1, borderColor: C.border },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.lift, alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 1, borderColor: C.border },
});
