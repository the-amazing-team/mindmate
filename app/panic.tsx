import { Colors, Radius, Spacing } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const TECHNIQUES = [
  {
    id: '1',
    title: '4-7-8 Breathing',
    icon: '🌬️',
    desc: 'Inhale 4 · Hold 7 · Exhale 8. A proven technique to activate the parasympathetic nervous system.',
    duration: '2 min',
    color: ['#8B5CF6', '#6D28D9'] as const,
  },
  {
    id: '2',
    title: '5-4-3-2-1 Grounding',
    icon: '🌿',
    desc: 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.',
    duration: '3 min',
    color: ['#10B981', '#059669'] as const,
  },
  {
    id: '3',
    title: 'Body Scan',
    icon: '🧘',
    desc: 'Slowly scan from your toes to your head, releasing tension in each area.',
    duration: '5 min',
    color: ['#06B6D4', '#0891B2'] as const,
  },
  {
    id: '4',
    title: 'Cold Water Reset',
    icon: '💧',
    desc: 'Splash cold water on your face or wrists. Triggers the dive reflex to slow your heart rate.',
    duration: '30 sec',
    color: ['#3B82F6', '#2563EB'] as const,
  },
  {
    id: '5',
    title: 'Positive Affirmations',
    icon: '💪',
    desc: '"I am safe. This will pass. I am stronger than this feeling."',
    duration: '1 min',
    color: ['#F59E0B', '#D97706'] as const,
  },
];

const HOTLINES = [
  { name: 'iCall India', num: '9152987821', flag: '🇮🇳' },
  { name: 'Vandrevala Foundation', num: '1860-2662-345', flag: '🇮🇳' },
  { name: 'Crisis Text Line', num: 'Text HOME to 741741', flag: '🌍' },
];

function BreathingCircle() {
  const scale = useRef(new Animated.Value(1)).current;
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [active, setActive] = useState(false);

  const startBreathing = () => {
    setActive(true);
    const cycle = () => {
      setPhase('inhale');
      Animated.timing(scale, { toValue: 1.6, duration: 4000, useNativeDriver: true }).start(() => {
        setPhase('hold');
        Animated.delay(7000).start(() => {
          setPhase('exhale');
          Animated.timing(scale, { toValue: 1, duration: 8000, useNativeDriver: true }).start(cycle);
        });
      });
    };
    cycle();
  };

  const stop = () => {
    setActive(false);
    scale.stopAnimation();
    Animated.timing(scale, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    setPhase('inhale');
  };

  const PHASE_TEXT = {
    inhale: 'Inhale...',
    hold: 'Hold...',
    exhale: 'Exhale...',
  };

  return (
    <View style={styles.breathingContainer}>
      <TouchableOpacity onPress={active ? stop : startBreathing} activeOpacity={0.9}>
        <Animated.View style={[styles.outerRing, { transform: [{ scale: scale.interpolate({ inputRange: [1, 1.6], outputRange: [1, 1.3] }) }] }]}>
          <Animated.View style={[styles.innerRing, { transform: [{ scale }] }]}>
            <View style={styles.circle}>
              <Text style={styles.circleEmoji}>{active ? '🌬️' : '▶'}</Text>
              <Text style={styles.circleText}>{active ? PHASE_TEXT[phase] : 'Tap to start'}</Text>
            </View>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
      <Text style={styles.breathingLabel}>4-7-8 Breathing Exercise</Text>
    </View>
  );
}

export default function PanicScreen() {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.root, { opacity: fadeAnim }]}>
      {/* Emergency Header */}
      <LinearGradient
        colors={['#EF4444', '#F97316']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🆘 Panic Mode</Text>
        <Text style={styles.headerSubtitle}>You are safe. Take a breath. This will pass.</Text>

        {/* Pulsing SOS */}
        <Animated.View style={[styles.sosWrapper, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.sosCircle}>
            <Text style={styles.sosText}>SOS</Text>
            <Text style={styles.sosSubText}>You're not alone</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Breathing Exercise */}
        <View style={styles.card}>
          <BreathingCircle />
        </View>

        {/* Grounding Techniques */}
        <Text style={styles.sectionTitle}>Grounding Techniques</Text>
        {TECHNIQUES.map(t => (
          <TouchableOpacity key={t.id} activeOpacity={0.85}>
            <LinearGradient
              colors={t.color}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.techniqueCard}
            >
              <View style={styles.techniqueLeft}>
                <Text style={styles.techniqueIcon}>{t.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.techniqueTitle}>{t.title}</Text>
                  <Text style={styles.techniqueDesc}>{t.desc}</Text>
                </View>
              </View>
              <View style={styles.techDuration}>
                <Text style={styles.techDurationText}>{t.duration}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        {/* Affirmation Banner */}
        <View style={styles.affirmationCard}>
          <Text style={styles.affirmationQuote}>
            "Right now, in this moment, I have survived every difficult day I've had. I will survive this one too."
          </Text>
          <TouchableOpacity style={styles.refreshBtn}>
            <Text style={styles.refreshBtnText}>↻ New affirmation</Text>
          </TouchableOpacity>
        </View>

        {/* Crisis Hotlines */}
        <Text style={styles.sectionTitle}>Crisis Helplines</Text>
        {HOTLINES.map((h, i) => (
          <TouchableOpacity key={i} style={styles.hotlineCard} activeOpacity={0.85}>
            <Text style={styles.hotlineFlag}>{h.flag}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.hotlineName}>{h.name}</Text>
              <Text style={styles.hotlineNum}>{h.num}</Text>
            </View>
            <View style={styles.callBtn}>
              <Text style={styles.callBtnText}>📞 Call</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* AI Chat Quick Access */}
        <TouchableOpacity
          style={styles.chatCTA}
          onPress={() => router.push('/(tabs)/chat' as any)}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#8B5CF6', '#6D28D9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.chatCTAGradient}
          >
            <Text style={styles.chatCTAIcon}>🧠</Text>
            <View>
              <Text style={styles.chatCTATitle}>Talk to MindMate AI</Text>
              <Text style={styles.chatCTASub}>Your AI companion is here for you, right now.</Text>
            </View>
            <Text style={styles.chatCTAArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.dark.bg },
  scroll: { padding: Spacing.md, paddingBottom: 40 },

  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  backBtn: { alignSelf: 'flex-start', marginBottom: Spacing.sm },
  backText: { color: 'rgba(255,255,255,0.8)', fontSize: 15 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 6 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: Spacing.lg, textAlign: 'center' },
  sosWrapper: { marginTop: 8 },
  sosCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosText: { fontSize: 22, fontWeight: '900', color: '#fff' },
  sosSubText: { fontSize: 9, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },

  breathingContainer: { alignItems: 'center', paddingVertical: Spacing.md },
  outerRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  innerRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.primary + '25',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary + '50',
  },
  circle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleEmoji: { fontSize: 28, marginBottom: 4 },
  circleText: { fontSize: 12, color: '#fff', fontWeight: '600', textAlign: 'center' },
  breathingLabel: { marginTop: Spacing.md, fontSize: 14, fontWeight: '600', color: Colors.dark.textSecondary },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark.text, marginBottom: Spacing.sm, marginTop: 4 },

  techniqueCard: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  techniqueLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  techniqueIcon: { fontSize: 28, flexShrink: 0 },
  techniqueTitle: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 4 },
  techniqueDesc: { fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 18 },
  techDuration: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    flexShrink: 0,
  },
  techDurationText: { fontSize: 11, color: '#fff', fontWeight: '700' },

  affirmationCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    alignItems: 'center',
  },
  affirmationQuote: {
    fontSize: 15,
    color: Colors.dark.text,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  refreshBtn: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  refreshBtnText: { fontSize: 13, color: Colors.primaryLight, fontWeight: '600' },

  hotlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  hotlineFlag: { fontSize: 24 },
  hotlineName: { fontSize: 14, fontWeight: '700', color: Colors.dark.text },
  hotlineNum: { fontSize: 12, color: Colors.dark.textSecondary, marginTop: 2 },
  callBtn: {
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  callBtnText: { fontSize: 12, color: Colors.success, fontWeight: '700' },

  chatCTA: { borderRadius: Radius.lg, overflow: 'hidden', marginTop: Spacing.sm },
  chatCTAGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: 14,
  },
  chatCTAIcon: { fontSize: 32 },
  chatCTATitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  chatCTASub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 3 },
  chatCTAArrow: { fontSize: 22, color: '#fff', fontWeight: '700', marginLeft: 'auto' },
});
