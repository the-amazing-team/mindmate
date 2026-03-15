import { BackBtn, Btn, ProgressDots, Screen } from "@/components/auth";
import { MindMateColors as C, MOOD_DATA } from "@/constants/theme";
import { ReactNode, useState } from "react";

interface OBWrapProps {
  step: number;
  total: number;
  onBack: () => void;
  aurora: string[];
  children: ReactNode;
}

const OBWrap = ({ step, total, onBack, aurora, children }: OBWrapProps) => (
  <Screen aurora={aurora} stars={11} scroll={false}>
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "13px 21px 24px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 13,
        }}
      >
        <BackBtn onClick={onBack} />
        <ProgressDots step={step} total={total} />
        <span
          style={{
            fontSize: 11,
            color: C.muted,
            fontFamily: "'Nunito',sans-serif",
            fontWeight: 700,
          }}
        >
          {step}/{total}
        </span>
      </div>
      {children}
    </div>
  </Screen>
);

export default function OnboardingScreen({
  onComplete,
  onSignOut,
}: {
  onComplete: () => void;
  onSignOut: () => void;
}) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    age_range: "",
    personality: "",
    goals: [] as string[],
    reminders: "daily",
  });

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const handleFinish = async (firstEntry?: {
    text?: string;
    mood?: number | null;
  }) => {
    onComplete();
  };

  const handleSignOut = async () => {
    onSignOut();
  };

  switch (step) {
    case 1:
      return (
        <AgeStep
          onNext={next}
          onBack={handleSignOut}
          value={data.age_range}
          onChange={(v) => setData({ ...data, age_range: v })}
        />
      );
    case 2:
      return (
        <PersonalityStep
          onNext={next}
          onBack={back}
          value={data.personality}
          onChange={(v) => setData({ ...data, personality: v })}
        />
      );
    case 3:
      return (
        <GoalsStep
          onNext={next}
          onBack={back}
          value={data.goals}
          onChange={(v) => setData({ ...data, goals: v })}
        />
      );
    case 4:
      return (
        <RemindersStep
          onNext={next}
          onBack={back}
          value={data.reminders}
          onChange={(v) => setData({ ...data, reminders: v })}
        />
      );
    case 5:
      return <FinalStep onNext={handleFinish} onBack={back} />;
    default:
      return null;
  }
}

function AgeStep({
  onNext,
  onBack,
  value,
  onChange,
}: {
  onNext: () => void;
  onBack: () => void;
  value: string;
  onChange: (v: string) => void;
}) {
  const ages = ["13–18", "18–25", "25–40", "40+"];
  const cols = [C.neon, C.cyan, C.rose, C.amber];
  return (
    <OBWrap step={1} total={5} onBack={onBack} aurora={[C.a4, C.a2, C.a1]}>
      <div style={{ animation: "fadeUp .45s both" }}>
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: 17,
            background: `${C.cyan}22`,
            border: `1px solid ${C.cyan}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            marginBottom: 13,
          }}
        >
          👤
        </div>
        <h2
          style={{
            fontFamily: "'Syne',sans-serif",
            fontWeight: 800,
            fontSize: 27,
            margin: "0 0 4px",
            color: C.text,
          }}
        >
          How old are you?
        </h2>
        <p
          style={{
            fontFamily: "'Nunito',sans-serif",
            color: C.sub,
            fontSize: 14,
            margin: "0 0 22px",
          }}
        >
          Personalizes your experience
        </p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 11,
          flex: 1,
        }}
      >
        {ages.map((a, i) => (
          <button
            key={a}
            onClick={() => onChange(a)}
            style={{
              padding: "24px 0",
              borderRadius: 19,
              border: `2px solid ${value === a ? cols[i] : "rgba(255,255,255,.06)"}`,
              background: value === a ? `${cols[i]}18` : `${C.lift}88`,
              color: value === a ? cols[i] : C.sub,
              fontSize: 21,
              fontWeight: 800,
              fontFamily: "'Syne',sans-serif",
              cursor: "pointer",
              transition: "all .25s",
              transform:
                value === a ? "translateY(-5px) scale(1.04)" : "translateY(0)",
              boxShadow: value === a ? `0 0 22px ${cols[i]}44` : "none",
            }}
          >
            {a}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 18 }}>
        <Btn full onClick={onNext} disabled={!value}>
          Continue
        </Btn>
      </div>
    </OBWrap>
  );
}

function PersonalityStep({
  onNext,
  onBack,
  value,
  onChange,
}: {
  onNext: () => void;
  onBack: () => void;
  value: string;
  onChange: (v: string) => void;
}) {
  const [qIdx, setQIdx] = useState(0);
  const [scores, setScores] = useState<number[]>([]);

  const questions = [
    {
      q: "I feel energized after spending time with many people.",
      type: "extro", // High score = Extrovert
    },
    {
      q: "I prefer deep one-on-one conversations over group activities.",
      type: "intro", // High score = Introvert
    },
    {
      q: "I often think before I speak, rather than thinking out loud.",
      type: "intro",
    },
    {
      q: "I enjoy being the center of attention in a room.",
      type: "extro",
    },
  ];

  const handleScore = (score: number) => {
    const nextScores = [...scores, score];
    setScores(nextScores);

    if (qIdx < questions.length - 1) {
      setQIdx(qIdx + 1);
    } else {
      // Calculate Personality
      let extroScore = 0;
      let introScore = 0;

      nextScores.forEach((s, i) => {
        if (questions[i].type === "extro") extroScore += s;
        else introScore += s;
      });

      // Simple inference: 
      // max score for each type is 2 questions * 5 = 10
      // If one is significantly higher, we pick it.
      // If they are close, it's an Ambivert.
      const diff = extroScore - introScore;
      let result = "ambivert";
      if (diff > 2) result = "extrovert";
      if (diff < -2) result = "introvert";
      
      onChange(result);
    }
  };

  if (value) {
    // Show summary/result before moving on
    const resultData = {
      introvert: { emoji: "🧠", title: "Introvert", sub: "Deep thinker & reflective" },
      extrovert: { emoji: "⚡", title: "Extrovert", sub: "Outward & expressive" },
      ambivert: { emoji: "🌊", title: "Ambivert", sub: "Balanced & adaptive" },
    }[value as "introvert" | "extrovert" | "ambivert"] || { emoji: "✨", title: value, sub: "" };

    return (
      <OBWrap step={2} total={5} onBack={() => { onChange(""); setQIdx(0); setScores([]); }} aurora={[C.a3, C.a1, C.a4]}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", animation: "fadeUp .5s both" }}>
          <div style={{ width: 80, height: 80, borderRadius: 28, background: `${C.amber}22`, border: `1px solid ${C.amber}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 20 }}>
            {resultData.emoji}
          </div>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 30, margin: "0 0 8px", color: C.text }}>
            You're an {resultData.title}!
          </h2>
          <p style={{ fontFamily: "'Nunito',sans-serif", color: C.sub, fontSize: 16, marginBottom: 32 }}>
            {resultData.sub}
          </p>
          <Btn full onClick={onNext} color={C.amber}>
            Continue
          </Btn>
          <button 
            onClick={() => { onChange(""); setQIdx(0); setScores([]); }}
            style={{ background: "none", border: "none", color: C.muted, fontSize: 13, marginTop: 16, cursor: "pointer", fontWeight: 600 }}
          >
            Retake Quiz
          </button>
        </div>
      </OBWrap>
    );
  }

  return (
    <OBWrap step={2} total={5} onBack={onBack} aurora={[C.a3, C.a1, C.a4]}>
      <div style={{ animation: "fadeUp .45s both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>
            PERSONALITY QUIZ · Q{qIdx + 1}/{questions.length}
          </span>
        </div>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 24, margin: "0 0 30px", color: C.text, lineHeight: 1.4 }}>
          {questions[qIdx].q}
        </h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        {[
          { label: "Strongly Agree", val: 5, col: C.neon },
          { label: "Agree", val: 4, col: `${C.neon}dd` },
          { label: "Neutral", val: 3, col: C.sub },
          { label: "Disagree", val: 2, col: `${C.rose}dd` },
          { label: "Strongly Disagree", val: 1, col: C.rose },
        ].map((opt) => (
          <button
            key={opt.val}
            onClick={() => handleScore(opt.val)}
            style={{
              padding: "16px 20px",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,.08)",
              background: `${C.lift}cc`,
              color: C.text,
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "'Nunito',sans-serif",
              cursor: "pointer",
              transition: "all .2s",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            {opt.label}
            <div style={{ width: 12, height: 12, borderRadius: 6, background: opt.col, opacity: .5 }} />
          </button>
        ))}
      </div>
    </OBWrap>
  );
}

function GoalsStep({
  onNext,
  onBack,
  value,
  onChange,
}: {
  onNext: () => void;
  onBack: () => void;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const goals = [
    { id: "stress", emoji: "🧘", label: "Reduce stress", color: C.cyan },
    {
      id: "emotions",
      emoji: "💭",
      label: "Understand emotions",
      color: C.neon,
    },
    {
      id: "confidence",
      emoji: "💪",
      label: "Build confidence",
      color: C.amber,
    },
    {
      id: "procrastinate",
      emoji: "⏰",
      label: "Beat procrastination",
      color: C.rose,
    },
    {
      id: "relationships",
      emoji: "❤️",
      label: "Better relationships",
      color: C.pink,
    },
    { id: "habits", emoji: "🌱", label: "Healthy habits", color: C.lime },
  ];
  const toggle = (id: string) => {
    const next = value.includes(id)
      ? value.filter((x) => x !== id)
      : [...value, id];
    onChange(next);
  };
  return (
    <OBWrap step={3} total={5} onBack={onBack} aurora={[C.a2, C.a4, C.a1]}>
      <div style={{ animation: "fadeUp .45s both" }}>
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: 17,
            background: `${C.lime}22`,
            border: `1px solid ${C.lime}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            marginBottom: 13,
          }}
        >
          🎯
        </div>
        <h2
          style={{
            fontFamily: "'Syne',sans-serif",
            fontWeight: 800,
            fontSize: 25,
            margin: "0 0 4px",
            color: C.text,
          }}
        >
          What would you like help with?
        </h2>
        <p
          style={{
            fontFamily: "'Nunito',sans-serif",
            color: C.sub,
            fontSize: 14,
            margin: "0 0 16px",
          }}
        >
          Select all that apply
        </p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 9,
          flex: 1,
        }}
      >
        {goals.map((g) => {
          const on = value.includes(g.id);
          return (
            <button
              key={g.id}
              onClick={() => toggle(g.id)}
              style={{
                padding: "13px 11px",
                borderRadius: 16,
                border: `2px solid ${on ? g.color : "rgba(255,255,255,.06)"}`,
                background: on ? `${g.color}18` : `${C.lift}88`,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all .25s",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 5,
                transform: on ? "scale(1.03) translateY(-2px)" : "scale(1)",
                boxShadow: on ? `0 0 18px ${g.color}44` : "none",
              }}
            >
              <span
                style={{
                  fontSize: 21,
                  filter: on ? `drop-shadow(0 0 6px ${g.color})` : "none",
                }}
              >
                {g.emoji}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: on ? g.color : C.sub,
                  fontFamily: "'Syne',sans-serif",
                  lineHeight: 1.3,
                }}
              >
                {g.label}
              </span>
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 16 }}>
        <Btn full onClick={onNext} color={C.lime} disabled={value.length === 0}>
          Continue ({value.length} selected)
        </Btn>
      </div>
    </OBWrap>
  );
}

function RemindersStep({
  onNext,
  onBack,
  value,
  onChange,
}: {
  onNext: () => void;
  onBack: () => void;
  value: string;
  onChange: (v: string) => void;
}) {
  const opts = [
    {
      id: "daily",
      emoji: "🔔",
      label: "Daily check-ins",
      sub: "Best for growth",
      color: C.neon,
    },
    {
      id: "occasional",
      emoji: "📬",
      label: "Occasional nudges",
      sub: "When I need it",
      color: C.amber,
    },
    {
      id: "none",
      emoji: "🔕",
      label: "No reminders",
      sub: "I'll go solo",
      color: C.sub,
    },
  ];
  return (
    <OBWrap step={4} total={5} onBack={onBack} aurora={[C.a3, C.a2, C.a4]}>
      <div style={{ animation: "fadeUp .45s both" }}>
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: 17,
            background: `${C.rose}22`,
            border: `1px solid ${C.rose}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            marginBottom: 13,
          }}
        >
          🔔
        </div>
        <h2
          style={{
            fontFamily: "'Syne',sans-serif",
            fontWeight: 800,
            fontSize: 26,
            margin: "0 0 4px",
            color: C.text,
          }}
        >
          Daily check-ins?
        </h2>
        <p
          style={{
            fontFamily: "'Nunito',sans-serif",
            color: C.sub,
            fontSize: 14,
            margin: "0 0 20px",
          }}
        >
          We'll gently remind you to reflect
        </p>
      </div>
      <div
        style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}
      >
        {opts.map((o) => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 13,
              padding: "15px 17px",
              borderRadius: 17,
              border: `2px solid ${value === o.id ? o.color : "rgba(255,255,255,.06)"}`,
              background: value === o.id ? `${o.color}18` : `${C.lift}88`,
              cursor: "pointer",
              fontFamily: "inherit",
              textAlign: "left",
              transition: "all .25s",
            }}
          >
            <span style={{ fontSize: 23 }}>{o.emoji}</span>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: value === o.id ? o.color : C.text,
                  fontFamily: "'Syne',sans-serif",
                }}
              >
                {o.label}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: C.sub,
                  marginTop: 2,
                  fontFamily: "'Nunito',sans-serif",
                }}
              >
                {o.sub}
              </div>
            </div>
            <div
              style={{
                width: 21,
                height: 21,
                borderRadius: 11,
                border: `2px solid ${value === o.id ? o.color : C.muted}`,
                background: value === o.id ? o.color : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all .2s",
                flexShrink: 0,
                fontSize: 11,
                color: "#000",
              }}
            >
              {value === o.id && "✓"}
            </div>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 17 }}>
        <Btn full onClick={onNext} color={C.rose}>
          Continue
        </Btn>
      </div>
    </OBWrap>
  );
}

function FinalStep({
  onNext,
  onBack,
}: {
  onNext: (firstEntry?: { mood?: number; text?: string }) => void;
  onBack: () => void;
}) {
  const [phase, setPhase] = useState("privacy");
  const [text, setText] = useState("");
  const [moodIdx, setMoodIdx] = useState<number | null>(null);

  if (phase === "privacy")
    return (
      <OBWrap step={5} total={5} onBack={onBack} aurora={[C.a1, C.a4, C.a2]}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            animation: "fadeUp .45s both",
          }}
        >
          <div style={{ position: "relative", marginBottom: 22 }}>
            <div
              style={{
                width: 78,
                height: 78,
                borderRadius: 27,
                background: `${C.a4}22`,
                border: `1px solid ${C.cyan}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 34,
                animation: "floatB 5s ease-in-out infinite",
                boxShadow: `0 0 28px ${C.cyan}44`,
              }}
            >
              🔒
            </div>
            <div
              style={{
                position: "absolute",
                inset: -7,
                borderRadius: 33,
                border: `1px solid ${C.cyan}22`,
                animation: "ringOut 2s ease-out infinite",
              }}
            />
          </div>
          <h2
            style={{
              fontFamily: "'Syne',sans-serif",
              fontWeight: 800,
              fontSize: 25,
              margin: "0 0 9px",
              color: C.text,
            }}
          >
            Your journal is private.
          </h2>
          <p
            style={{
              fontFamily: "'Nunito',sans-serif",
              color: C.sub,
              fontSize: 14,
              lineHeight: 1.7,
              margin: "0 0 22px",
              maxWidth: 260,
            }}
          >
            End-to-end encrypted. Only you can read your entries.
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              width: "100%",
            }}
          >
            {[
              "🔒 Entries are end-to-end encrypted",
              "👁 Only you can see your journal",
              "🤖 AI analysis stays private",
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  padding: "11px 15px",
                  borderRadius: 13,
                  background: `${C.lift}99`,
                  border: `1px solid rgba(255,255,255,.06)`,
                  animation: `fadeUp .45s ${0.12 + i * 0.09}s both`,
                }}
              >
                <span style={{ fontSize: 14 }}>{item.slice(0, 2)}</span>
                <span
                  style={{
                    fontSize: 13,
                    color: C.sub,
                    fontFamily: "'Nunito',sans-serif",
                  }}
                >
                  {item.slice(3)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <Btn full onClick={() => setPhase("entry")} color={C.cyan}>
          Let's Begin ✦
        </Btn>
      </OBWrap>
    );

  return (
    <OBWrap
      step={5}
      total={5}
      onBack={() => setPhase("privacy")}
      aurora={[C.a1, C.a4, C.a2]}
    >
      <div
        style={{
          animation: "fadeUp .45s both",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2
          style={{
            fontFamily: "'Syne',sans-serif",
            fontWeight: 800,
            fontSize: 23,
            margin: "0 0 4px",
            color: C.text,
          }}
        >
          Your first reflection ✦
        </h2>
        <p
          style={{
            fontFamily: "'Nunito',sans-serif",
            color: C.sub,
            fontSize: 14,
            margin: "0 0 14px",
          }}
        >
          How are you feeling?
        </p>
        <div style={{ display: "flex", gap: 7, marginBottom: 14 }}>
          {MOOD_DATA.map((m, i) => (
            <button
              key={i}
              onClick={() => setMoodIdx(i)}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 12,
                border: `2px solid ${moodIdx === i ? m.c : "transparent"}`,
                background: moodIdx === i ? `${m.c}18` : `${C.lift}88`,
                fontSize: 21,
                cursor: "pointer",
                transition: "all .2s",
                transform:
                  moodIdx === i ? "scale(1.1) translateY(-3px)" : "scale(1)",
                boxShadow: moodIdx === i ? `0 5px 16px ${m.c}44` : "none",
              }}
            >
              {m.e}
            </button>
          ))}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your thoughts here..."
          style={{
            flex: 1,
            minHeight: 130,
            background: `${C.lift}88`,
            border: `1.5px solid ${text ? C.neon + "55" : "rgba(255,255,255,.08)"}`,
            borderRadius: 16,
            padding: 14,
            color: C.text,
            fontSize: 14,
            fontFamily: "'Nunito',sans-serif",
            resize: "none",
            outline: "none",
            lineHeight: 1.75,
          }}
        />
      </div>
      <div style={{ marginTop: 15 }}>
        <Btn full onClick={() => onNext({ mood: moodIdx ?? undefined, text })}>
          Enter MindMate →
        </Btn>
      </div>
    </OBWrap>
  );
}
