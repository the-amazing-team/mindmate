import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const C = {
  void: "#04060F",
  deep: "#080C1A",
  surface: "#0C1020",
  lift: "#111827",
  card: "#141C30",
  border: "rgba(148,163,184,0.08)",
  neon: "#A78BFA",
  cyan: "#34D399",
  rose: "#F87171",
  amber: "#FBBF24",
  lime: "#86EFAC",
  pink: "#F472B6",
  blue: "#60A5FA",
  text: "#F8FAFF",
  sub: "#94A3B8",
  muted: "#3D4F6A",
  a1: "#6D28D9",
  a2: "#0F766E",
  a3: "#9F1239",
  a4: "#1D4ED8",
};

const AFFIRMATIONS = [
  "This feeling is temporary. It will pass.",
  "I am safe right now. My body is doing its job.",
  "I have gotten through hard moments before.",
  "I choose calm. I breathe and return to now.",
];

const GROUND = [
  { n: 5, sense: "See", q: "Name 5 things you can see right now" },
  { n: 4, sense: "Touch", q: "Name 4 things you can physically feel" },
  { n: 3, sense: "Hear", q: "Name 3 sounds you can hear" },
  { n: 2, sense: "Smell", q: "Name 2 things you can smell" },
  { n: 1, sense: "Taste", q: "Name 1 thing you can taste" },
];

type OrbProps = { x: number; y: number; size: number; color: string; delay?: number };
const Orb: React.FC<OrbProps> = ({ x, y, size, color, delay = 0 }) => (
  <View style={{
    position: "absolute",
    left: `${x}%`,
    top: `${y}%`,
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color + "28",
    transform: [{ translateX: -size / 2 }, { translateY: -size / 2 }],
  }} />
);

type GlassCardProps = { children: React.ReactNode; style?: object; onPress?: () => void; delay?: number };
const GlassCard: React.FC<GlassCardProps> = ({ children, style = {}, onPress = undefined, delay = 0 }) => (
  <TouchableOpacity onPress={onPress} style={{
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    ...style
  }}>
    {children}
  </TouchableOpacity>
);

type Phase = "idle"|"breathe"|"ground"|"affirm"|"done";
type BreatheStep = "in"|"hold"|"out";

export default function PanicScreen() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [breatheStep, setBreatheStep] = useState<BreatheStep>("in");
  const [breatheCount, setBreatheCount] = useState<number>(0);
  const [groundStep, setGroundStep] = useState<number>(0);
  const [affirmIdx, setAffirmIdx] = useState<number>(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (phase === "breathe") {
      const cycle = async () => {
        setBreatheStep("in");
        await new Promise(r => setTimeout(r, 4000));
        setBreatheStep("hold");
        await new Promise(r => setTimeout(r, 7000));
        setBreatheStep("out");
        await new Promise(r => setTimeout(r, 8000));
        setBreatheCount(c => {
          if (c + 1 >= 3) { setPhase("ground"); return 0; }
          return c + 1;
        });
      };
      timerRef.current = setTimeout(cycle, 100);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase, breatheCount]);

  const breatheScale = breatheStep === "in" ? 1.55 : breatheStep === "hold" ? 1.55 : 1;
  const breatheLabel = breatheStep === "in" ? "Breathe In" : breatheStep === "hold" ? "Hold" : "Breathe Out";
  const breatheColor = breatheStep === "in" ? C.cyan : breatheStep === "hold" ? C.neon : C.rose;

  if (phase === "idle") return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.void }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        <View style={{ alignItems: "center", marginBottom: 28 }}>
          <View style={{
            width: 68,
            height: 68,
            borderRadius: 24,
            backgroundColor: C.rose + "18",
            borderWidth: 1,
            borderColor: C.rose + "44",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14
          }}>
            <Text style={{ fontSize: 28 }}>🆘</Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: "800", color: C.text, marginBottom: 6 }}>Panic Mode</Text>
          <Text style={{ fontSize: 13, color: C.sub, lineHeight: 17, maxWidth: 260, textAlign: "center" }}>
            You're safe. We'll guide you through a 3-step reset using breathing, grounding, and affirmations.
          </Text>
        </View>

        <TouchableOpacity onPress={() => setPhase("breathe")} style={{
          padding: 24,
          borderRadius: 24,
          backgroundColor: C.rose + "22",
          borderWidth: 1.5,
          borderColor: C.rose + "55",
          alignItems: "center",
          marginBottom: 20
        }}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>🌬️</Text>
          <Text style={{ fontSize: 18, fontWeight: "800", color: C.rose, marginBottom: 4 }}>Start 4-7-8 Breathing</Text>
          <Text style={{ fontSize: 13, color: C.sub }}>3 cycles · ~3 minutes</Text>
        </TouchableOpacity>

        <View style={{ gap: 12 }}>
          {[
            { icon: "🧘", title: "5-4-3-2-1 Grounding", sub: "Anchor to the present moment", color: C.cyan },
            { icon: "💬", title: "Crisis Line", sub: "Talk to a real human · 24/7 free", color: C.amber },
            { icon: "🤖", title: "Chat with MindMate AI", sub: "I'm here. Tell me what's happening.", color: C.neon },
          ].map((a, i) => (
            <GlassCard key={i} style={{ padding: 16, flexDirection: "row", alignItems: "center", gap: 16 }}
              onPress={() => a.title.includes("Grounding") && setPhase("ground")}>
              <View style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: a.color + "18",
                borderWidth: 1,
                borderColor: a.color + "33",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Text style={{ fontSize: 20 }}>{a.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: a.color }}>{a.title}</Text>
                <Text style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>{a.sub}</Text>
              </View>
              <Text style={{ color: C.muted, fontSize: 18 }}>›</Text>
            </GlassCard>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  if (phase === "breathe") return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.void }} edges={['top']}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Orb x={50} y={30} size={300} color={breatheColor} />
        <View style={{ alignItems: "center", gap: 24 }}>
          <Text style={{ fontSize: 12, color: C.muted, fontWeight: "700", letterSpacing: 1 }}>
            CYCLE {breatheCount + 1} OF 3
          </Text>
          <View style={{ width: 200, height: 200, alignItems: "center", justifyContent: "center" }}>
            <View style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: breatheColor + "33",
              borderWidth: 2,
              borderColor: breatheColor + "55",
              transform: [{ scale: breatheScale }],
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Text style={{ color: C.text, fontSize: 18, fontWeight: "800" }}>{breatheStep.toUpperCase()}</Text>
            </View>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 28, fontWeight: "900", color: breatheColor }}>{breatheLabel}</Text>
            <Text style={{ fontSize: 14, color: C.sub, marginTop: 8, textAlign: "center" }}>
              {breatheStep === "in" ? "Inhale slowly through your nose" :
               breatheStep === "hold" ? "Hold gently, stay still" :
               "Exhale fully through your mouth"}
            </Text>
          </View>
          <TouchableOpacity onPress={() => { setPhase("idle"); setBreatheCount(0); }} style={{
            marginTop: 40,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: C.border
          }}>
            <Text style={{ color: C.muted, fontSize: 14 }}>Cancel Session</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );

  if (phase === "ground") return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.void }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        <View style={{ alignItems: "center" }}>
          <View style={{
            width: 64,
            height: 64,
            borderRadius: 22,
            backgroundColor: C.cyan + "18",
            borderWidth: 1,
            borderColor: C.cyan + "33",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16
          }}>
            <Text style={{ fontSize: 28 }}>🧘</Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: "800", color: C.text, marginBottom: 8 }}>Grounding Exercise</Text>
          <Text style={{ fontSize: 14, color: C.sub, textAlign: "center" }}>Anchor yourself to the here and now</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 8, justifyContent: "center", marginVertical: 32 }}>
          {GROUND.map((g, i) => (
            <View key={i} style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: i === groundStep ? C.cyan + "22" : i < groundStep ? C.lime + "18" : C.lift,
              borderWidth: 1,
              borderColor: i === groundStep ? C.cyan : i < groundStep ? C.lime : C.border,
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: "700",
                color: i === groundStep ? C.cyan : i < groundStep ? C.lime : C.muted
              }}>
                {i < groundStep ? "✓" : g.n}
              </Text>
            </View>
          ))}
        </View>

        <GlassCard style={{
          padding: 24,
          alignItems: "center",
          backgroundColor: C.cyan + "12",
          borderWidth: 1,
          borderColor: C.cyan + "22"
        }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>
            {groundStep === 0 ? "👀" : groundStep === 1 ? "🤚" : groundStep === 2 ? "👂" : groundStep === 3 ? "👃" : "👅"}
          </Text>
          <Text style={{ fontSize: 12, color: C.cyan, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
            {GROUND[groundStep]?.sense}
          </Text>
          <Text style={{ fontSize: 18, color: C.text, fontWeight: "600", textAlign: "center", lineHeight: 26 }}>
            {GROUND[groundStep]?.q}
          </Text>
        </GlassCard>

        <View style={{ flexDirection: "row", gap: 12, marginTop: 32 }}>
          <TouchableOpacity onPress={() => { if (groundStep > 0) setGroundStep(s => s - 1); }} style={{
            flex: 1,
            padding: 16,
            borderRadius: 16,
            backgroundColor: C.lift,
            borderWidth: 1,
            borderColor: C.border,
            alignItems: "center"
          }}>
            <Text style={{ color: C.sub, fontSize: 14, fontWeight: "600" }}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            if (groundStep < GROUND.length - 1) setGroundStep(s => s + 1);
            else setPhase("affirm");
          }} style={{
            flex: 2,
            padding: 16,
            borderRadius: 16,
            backgroundColor: C.a2,
            alignItems: "center"
          }}>
            <Text style={{ color: C.text, fontSize: 14, fontWeight: "700" }}>
              {groundStep < GROUND.length - 1 ? "Next →" : "Finish →"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  if (phase === "affirm") return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.void }} edges={['top']}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Orb x={50} y={40} size={300} color={C.neon} />
        <View style={{ width: "100%", alignItems: "center", gap: 32 }}>
          <Text style={{ fontSize: 48 }}>💜</Text>
          <GlassCard style={{
            padding: 24,
            width: "100%",
            alignItems: "center",
            backgroundColor: C.a1 + "12",
            borderWidth: 1,
            borderColor: C.neon + "22"
          }}>
            <Text style={{
              fontSize: 20,
              color: C.text,
              textAlign: "center",
              lineHeight: 30,
              fontWeight: "600"
            }}>
              "{AFFIRMATIONS[affirmIdx]}"
            </Text>
          </GlassCard>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {AFFIRMATIONS.map((_, i) => (
              <View key={i} style={{
                width: i === affirmIdx ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === affirmIdx ? C.neon : C.neon + "22",
              }} />
            ))}
          </View>
          <TouchableOpacity
            onPress={() => {
              if (affirmIdx < AFFIRMATIONS.length - 1) setAffirmIdx(i => i + 1);
              else setPhase("idle");
            }}
            style={{
              width: "100%",
              padding: 18,
              borderRadius: 18,
              backgroundColor: affirmIdx === AFFIRMATIONS.length - 1 ? C.cyan : C.a1,
              alignItems: "center"
            }}
          >
            <Text style={{ color: affirmIdx === AFFIRMATIONS.length - 1 ? C.deep : C.text, fontSize: 16, fontWeight: "800" }}>
              {affirmIdx < AFFIRMATIONS.length - 1 ? "Next Affirmation" : "I Feel Better Now"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );

  return null;
}