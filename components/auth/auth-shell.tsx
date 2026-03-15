import { MindMateColors as C } from '@/constants/theme'
import { Aurora } from './aurora'
import { Stars } from './stars'

export const AuthShell = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      minHeight: "100vh",
      background: C.void,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <Aurora colors={[C.a1, C.a4, C.a2]} />
    <Stars n={24} />
    {/* Rings */}
    {[500, 380, 260].map((s, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          width: s,
          height: s,
          borderRadius: "50%",
          border: `1px solid rgba(192,132,252,${0.04 + i * 0.03})`,
          animation: `floatB ${7 + i}s ${i}s ease-in-out infinite`,
          pointerEvents: "none",
        }}
      />
    ))}
    <div
      style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 420 }}
    >
      {/* Logo */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 32,
          animation: "fadeUp .6s both",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 26,
            margin: "0 auto 16px",
            background: `linear-gradient(135deg,${C.a1},${C.neon},${C.cyan})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            boxShadow: `0 0 40px ${C.neon}55`,
            animation: "floatB 5s ease-in-out infinite",
          }}
        >
          🧠
        </div>
        <h1
          style={{
            fontFamily: "'Syne',sans-serif",
            fontWeight: 800,
            fontSize: 36,
            margin: "0 0 6px",
            background: `linear-gradient(135deg,#fff,${C.neon},${C.cyan})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundSize: "200% auto",
            animation: "shimmer 4s linear infinite",
          }}
        >
          MindMate
        </h1>
        <p
          style={{
            fontSize: 13,
            color: C.sub,
            letterSpacing: ".15em",
            textTransform: "uppercase",
            fontFamily: "'Nunito',sans-serif",
            fontWeight: 300,
          }}
        >
          Reflect · Evolve · Connect
        </p>
      </div>
      {children}
    </div>
  </div>
);
