import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';

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
    // animation not supported in RN, skip
  }} />
);

type GlassCardProps = { children: React.ReactNode; style?: object; onPress?: () => void; delay?: number };
const GlassCard: React.FC<GlassCardProps> = ({ children, style = {}, onPress = undefined, delay = 0 }) => (
  <TouchableOpacity onPress={onPress} style={{
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    // animation not supported, skip
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
  const timerRef = useRef<NodeJS.Timeout|null>(null);

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
    <ScrollView style={{ flex: 1, padding: 20 }}>
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
        padding: 18,
        borderRadius: 18,
        backgroundColor: C.rose + "22",
        borderWidth: 1.5,
        borderColor: C.rose + "55",
        alignItems: "center",
        marginBottom: 14
      }}>
        <Text style={{ fontSize: 24, marginBottom: 6 }}>🌬️</Text>
        <Text style={{ fontSize: 15, fontWeight: "800", color: C.rose, marginBottom: 4 }}>Start 4-7-8 Breathing</Text>
        <Text style={{ fontSize: 12, color: C.sub }}>3 cycles · ~3 minutes · Activates calm response</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: "column", gap: 8 }}>
        {[
          { icon: "🧘", title: "5-4-3-2-1 Grounding", sub: "Anchor to the present moment", color: C.cyan },
          { icon: "💬", title: "Crisis Line", sub: "Talk to a real human · 24/7 free", color: C.amber },
          { icon: "🤖", title: "Chat with MindMate AI", sub: "I'm here. Tell me what's happening.", color: C.neon },
        ].map((a, i) => (
          <GlassCard key={i} delay={0.2 + i * 0.07} style={{ padding: 13, flexDirection: "row", alignItems: "center", gap: 12 }}
            onPress={() => a.title.includes("Grounding") && setPhase("ground")}>
            <View style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: a.color + "18",
              borderWidth: 1,
              borderColor: a.color + "33",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Text style={{ fontSize: 16 }}>{a.icon}</Text>
            </View>
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: a.color }}>{a.title}</Text>
              <Text style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>{a.sub}</Text>
            </View>
            <Text style={{ marginLeft: "auto", color: C.muted, fontSize: 14 }}>›</Text>
          </GlassCard>
        ))}
      </View>
    </ScrollView>
  );

  if (phase === "breathe") return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
      <Orb x={50} y={30} size={300} color={breatheColor} delay={0} />
      <View style={{ position: "relative", zIndex: 2, alignItems: "center", gap: 20 }}>
        <Text style={{ fontSize: 10, color: C.muted, fontWeight: "700", letterSpacing: 0.14, textTransform: "uppercase" }}>
          Cycle {breatheCount + 1} of 3
        </Text>
        <View style={{ position: "relative", width: 160, height: 160, alignItems: "center", justifyContent: "center" }}>
          {[1, 1.4, 1.8].map((s, i) => (
            <View key={i} style={{
              position: "absolute",
              width: 160,
              height: 160,
              borderRadius: 80,
              borderWidth: 1,
              borderColor: breatheColor + (20 - i * 5).toString(16),
              transform: [{ scale: breatheScale * s }],
            }} />
          ))}
          <View style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: breatheColor + "44",
            borderWidth: 2,
            borderColor: breatheColor + "66",
            transform: [{ scale: breatheScale }],
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Text style={{ fontSize: 28 }}>
              {breatheStep === "in" ? "☁️" : breatheStep === "hold" ? "✨" : "🌊"}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 22, fontWeight: "800", color: breatheColor, letterSpacing: -0.02 }}>
            {breatheLabel}
          </Text>
          <Text style={{ fontSize: 13, color: C.sub, marginTop: 5 }}>
            {breatheStep === "in" ? "Inhale slowly through your nose (4s)" :
             breatheStep === "hold" ? "Hold gently, stay still (7s)" :
             "Exhale fully through your mouth (8s)"}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {[0, 1, 2].map(i => (
            <View key={i} style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i < breatheCount ? breatheColor : breatheColor + "30",
            }} />
          ))}
        </View>
        <TouchableOpacity onPress={() => { setPhase("idle"); setBreatheCount(0); }} style={{
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: C.border,
          borderRadius: 10,
          paddingHorizontal: 18,
          paddingVertical: 8
        }}>
          <Text style={{ color: C.muted, fontSize: 12 }}>End session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (phase === "ground") return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <View style={{ alignItems: "center" }}>
        <View style={{
          width: 56,
          height: 56,
          borderRadius: 20,
          backgroundColor: C.cyan + "18",
          borderWidth: 1,
          borderColor: C.cyan + "33",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12
        }}>
          <Text style={{ fontSize: 22 }}>🧘</Text>
        </View>
        <Text style={{ fontSize: 20, fontWeight: "800", color: C.text, marginBottom: 4 }}>5-4-3-2-1 Grounding</Text>
        <Text style={{ fontSize: 12, color: C.sub, lineHeight: 16 }}>
          Anchor yourself to the present moment
        </Text>
      </View>
      <View style={{ flexDirection: "row", gap: 6, justifyContent: "center", marginTop: 16 }}>
        {GROUND.map((g, i) => (
          <View key={i} style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            backgroundColor: i === groundStep ? C.cyan + "22" : i < groundStep ? C.lime + "18" : C.lift + "55",
            borderWidth: 1,
            borderColor: i === groundStep ? C.cyan : i < groundStep ? C.lime : C.border,
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: "700",
              color: i === groundStep ? C.cyan : i < groundStep ? C.lime : C.muted
            }}>
              {i < groundStep ? "✓" : g.n}
            </Text>
          </View>
        ))}
      </View>
      <GlassCard style={{
        padding: 20,
        alignItems: "center",
        backgroundColor: C.cyan + "12",
        borderWidth: 1,
        borderColor: C.cyan + "22",
        marginTop: 16
      }}>
        <Text style={{ fontSize: 32, marginBottom: 8 }}>
          {groundStep === 0 ? "👀" : groundStep === 1 ? "🤚" : groundStep === 2 ? "👂" : groundStep === 3 ? "👃" : "👅"}
        </Text>
        <Text style={{ fontSize: 11, color: C.cyan, fontWeight: "700", letterSpacing: 0.1, textTransform: "uppercase", marginBottom: 8 }}>
          {GROUND[groundStep]?.sense}
        </Text>
        <Text style={{ fontSize: 15, color: C.text, fontWeight: "600", lineHeight: 22.5 }}>
          {GROUND[groundStep]?.q}
        </Text>
      </GlassCard>
      <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
        <TouchableOpacity onPress={() => { if (groundStep > 0) setGroundStep(s => s - 1); }} style={{
          flex: 1,
          padding: 12,
          borderRadius: 13,
          backgroundColor: C.lift + "88",
          borderWidth: 1,
          borderColor: C.border,
          alignItems: "center"
        }}>
          <Text style={{ color: C.sub, fontSize: 12 }}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          if (groundStep < GROUND.length - 1) setGroundStep(s => s + 1);
          else setPhase("affirm");
        }} style={{
          flex: 2,
          padding: 12,
          borderRadius: 13,
          backgroundColor: C.a2 + "CC",
          borderWidth: 1,
          borderColor: C.cyan + "44",
          alignItems: "center"
        }}>
          <Text style={{ color: C.text, fontSize: 13, fontWeight: "700" }}>
            {groundStep < GROUND.length - 1 ? "I named them →" : "Done! Continue →"}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => setPhase("idle")} style={{ alignItems: "center", paddingVertical: 4, marginTop: 8 }}>
        <Text style={{ color: C.muted, fontSize: 12 }}>← Back to Panic Mode</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  if (phase === "affirm") return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 20 }}>
      <Orb x={50} y={40} size={280} color={C.neon} delay={0} />
      <View style={{ position: "relative", zIndex: 2, width: "100%", alignItems: "center", gap: 18 }}>
        <Text style={{ fontSize: 36 }}>💜</Text>
        <Text style={{ fontSize: 10, color: C.muted, fontWeight: "700", letterSpacing: 0.14, textTransform: "uppercase" }}>
          {affirmIdx + 1} of {AFFIRMATIONS.length}
        </Text>
        <GlassCard style={{
          padding: 20,
          alignItems: "center",
          borderWidth: 1,
          borderColor: C.neon + "25",
          backgroundColor: C.a1 + "12"
        }}>
          <Text style={{
            fontSize: 17,
            color: C.text,
            lineHeight: 25.5,
            fontWeight: "600",
            letterSpacing: -0.01,
            textAlign: "center"
          }}>
            "{AFFIRMATIONS[affirmIdx]}"
          </Text>
        </GlassCard>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {AFFIRMATIONS.map((_, i) => (
            <View key={i} style={{
              width: i === affirmIdx ? 18 : 7,
              height: 7,
              borderRadius: 4,
              backgroundColor: i === affirmIdx ? C.neon : C.neon + "30",
            }} />
          ))}
        </View>
        {affirmIdx < AFFIRMATIONS.length - 1 ? (
          <TouchableOpacity onPress={() => setAffirmIdx(i => i + 1)} style={{
            paddingHorizontal: 28,
            paddingVertical: 13,
            borderRadius: 14,
            backgroundColor: C.a1,
            borderWidth: 1,
            borderColor: C.neon + "44",
            alignItems: "center"
          }}>
            <Text style={{ color: C.text, fontSize: 13, fontWeight: "700" }}>Next affirmation →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setPhase("idle")} style={{
            paddingHorizontal: 28,
            paddingVertical: 13,
            borderRadius: 14,
            backgroundColor: C.cyan + "AA",
            borderWidth: 1,
            borderColor: C.cyan + "44",
            alignItems: "center"
          }}>
            <Text style={{ color: C.deep, fontSize: 13, fontWeight: "700" }}>✓ I feel better now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return null;
}