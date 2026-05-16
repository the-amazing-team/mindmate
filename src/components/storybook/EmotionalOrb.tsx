import { moodPalette, type Mood } from "@/lib/storybook-context";

export function EmotionalOrb({ mood, size = 280 }: { mood: Mood; size?: number }) {
  const m = moodPalette[mood];
  return (
    <div
      className="relative flex items-center justify-center animate-pulse-glow"
      style={
        {
          width: size,
          height: size,
          borderRadius: "9999px",
          background: m.gradient,
          ["--glow-color" as string]: m.glow,
        } as React.CSSProperties
      }
    >
      {/* inner shimmer */}
      <div
        className="absolute inset-3 rounded-full opacity-70 animate-drift"
        style={{
          background: `radial-gradient(circle at 30% 30%, oklch(1 0 0 / 0.5), transparent 60%)`,
        }}
      />
      <div
        className="absolute inset-8 rounded-full opacity-40 animate-drift"
        style={{
          animationDelay: "2s",
          background: `radial-gradient(circle at 70% 70%, oklch(1 0 0 / 0.4), transparent 60%)`,
        }}
      />
      {/* floating tiny orbits */}
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="absolute rounded-full animate-drift"
          style={{
            width: 8,
            height: 8,
            background: m.color,
            boxShadow: `0 0 18px ${m.color}`,
            top: `${20 + i * 20}%`,
            left: `${15 + i * 25}%`,
            animationDelay: `${i * 1.5}s`,
            animationDuration: `${6 + i * 2}s`,
          }}
        />
      ))}
    </div>
  );
}
