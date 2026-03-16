import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { C } from '@/constants/theme';

const EMOTION_COLORS: Record<string, string> = {
  anxious: '#FB7185',  hopeful: '#A3E635',  frustrated: '#FB923C',
  content: '#22D3EE',  sad: '#60A5FA',      excited: '#FBBF24',
  neutral: '#94A3C8',  angry: '#F472B6',
};

function emotionColor(e: string | null) {
  return EMOTION_COLORS[e?.toLowerCase() ?? ''] ?? C.neon;
}

export default function InsightsScreen() {
  const user = null;
  const sections: any[] = [];
  const journalLoading = false;
  const data = {
    totalSections: 0,
    avgScore: 0,
    streak: 0,
    weekEmotions: [] as any[],
    topEmotions: [] as any[],
    loading: false,
    aiSummary: null,
    recommendation: null,
  };
  const refreshSummary = () => {};

  const loading = journalLoading;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Insights ◈</Text>
          <Text style={{ fontSize: 11, color: C.muted }}>AI pattern recognition</Text>
        </View>
        <Pressable onPress={refreshSummary} style={s.refreshBtn}>
          <Text style={{ fontSize: 11, color: C.neon }}>↻ Refresh</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={C.neon} />
          <Text style={{ fontSize: 12, color: C.muted, marginTop: 10 }}>Loading your data...</Text>
        </View>
      ) : data.totalSections === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 40, marginBottom: 14 }}>📊</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 8 }}>No data yet</Text>
          <Text style={{ fontSize: 13, color: C.sub, textAlign: 'center', lineHeight: 20 }}>
            Write your first journal entry to see patterns and AI insights here.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          {/* KPIs */}
          <Animated.View entering={FadeInDown.delay(40).springify()} style={s.kpiRow}>
            {[
              { label: 'Avg intensity', val: data.avgScore.toFixed(2), color: C.lime  },
              { label: 'Streak',        val: `${data.streak}d`,        color: C.amber },
              { label: 'Sections',      val: `${data.totalSections}`,  color: C.cyan  },
            ].map((k, i) => (
              <View key={i} style={s.kpiCard}>
                <Text style={[s.kpiVal, { color: k.color }]}>{k.val}</Text>
                <Text style={s.kpiLabel}>{k.label.toUpperCase()}</Text>
              </View>
            ))}
          </Animated.View>

          {/* 7-day emotion timeline */}
          <Animated.View entering={FadeInDown.delay(80).springify()} style={s.card}>
            <Text style={s.sectionLabel}>EMOTION TIMELINE — LAST 7 DAYS</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 60 }}>
              {data.weekEmotions.map((e, i) => {
                const h    = e.score != null ? Math.round(e.score * 48) + 10 : 5;
                const col  = e.emotion ? emotionColor(e.emotion) : C.muted + '30';
                const days = ['M','T','W','T','F','S','S'];
                return (
                  <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                    <View style={{ width: '100%', height: h, borderRadius: 4, backgroundColor: col + 'AA' }} />
                    <Text style={{ fontSize: 9, color: i === 6 ? C.neon : C.muted }}>{days[i]}</Text>
                  </View>
                );
              })}
            </View>
          </Animated.View>

          {/* Top emotions */}
          {data.topEmotions.length > 0 && (
            <Animated.View entering={FadeInDown.delay(120).springify()} style={s.card}>
              <Text style={s.sectionLabel}>TOP EMOTIONS</Text>
              {data.topEmotions.map((e, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 9,
                  marginBottom: i < data.topEmotions.length - 1 ? 10 : 0 }}>
                  <Text style={{ fontSize: 12, color: C.sub, flex: 1, textTransform: 'capitalize' }}>
                    {e.emotion}
                  </Text>
                  <View style={{ width: 100, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <View style={{ width: `${e.pct}%`, height: '100%', borderRadius: 3,
                      backgroundColor: emotionColor(e.emotion) }} />
                  </View>
                  <Text style={{ fontSize: 10, color: emotionColor(e.emotion),
                    fontWeight: '700', width: 16, textAlign: 'right' }}>{e.count}</Text>
                </View>
              ))}
            </Animated.View>
          )}

          {/* AI Summary */}
          <Animated.View entering={FadeInDown.delay(160).springify()}
            style={[s.card, { backgroundColor: C.a1 + '10', borderColor: C.neon + '25' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Text style={{ fontSize: 16 }}>🤖</Text>
              <Text style={{ fontSize: 10, fontWeight: '700', color: C.neon, letterSpacing: 1 }}>
                AI WEEKLY SUMMARY
              </Text>
            </View>

            {data.loading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <ActivityIndicator size="small" color={C.neon} />
                <Text style={{ fontSize: 13, color: C.muted }}>Analysing your patterns...</Text>
              </View>
            ) : data.aiSummary ? (
              <>
                <Text style={{ fontSize: 13, color: C.text, lineHeight: 22, marginBottom: 12 }}>
                  {data.aiSummary}
                </Text>
                {data.recommendation && (
                  <View style={{ backgroundColor: C.lime + '18', borderRadius: 10, padding: 10,
                    borderWidth: 1, borderColor: C.lime + '33' }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: C.lime, marginBottom: 4 }}>
                      SUGGESTION
                    </Text>
                    <Text style={{ fontSize: 12, color: C.sub, lineHeight: 18 }}>
                      {data.recommendation}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <Text style={{ fontSize: 12, color: C.muted }}>
                Configure your Supabase + Anthropic API keys to enable AI summaries.
              </Text>
            )}
          </Animated.View>

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
});
