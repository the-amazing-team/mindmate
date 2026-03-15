import { MindMateColors as C } from '@/constants/theme'
import { Aurora } from './aurora'
import { Stars } from './stars'

export const AuthShell = ({ children }: { children: React.ReactNode }) => (
  <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", background: C.void }}>
    <Aurora colors={[C.a1, C.a4, C.a2]} />
    <Stars n={20} />
    {[340, 260, 180].map((s, i) => (
      <div key={i} style={{
        position: "absolute", width: s, height: s, borderRadius: "50%",
        border: `1px solid rgba(192,132,252,${.04 + i * .03})`, top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        animation: `floatB ${7 + i}s ${i}s ease-in-out infinite`, pointerEvents: "none"
      }} />
    ))}
    <div style={{ position: "relative", zIndex: 2, flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 22px" }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 28, animation: "fadeUp .6s both" }}>
          <div style={{
            width: 68, height: 68, borderRadius: 24, margin: "0 auto 14px",
            background: `linear-gradient(135deg,${C.a1},${C.neon},${C.cyan})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30,
            boxShadow: `0 0 36px ${C.neon}55`, animation: "floatB 5s ease-in-out infinite"
          }}>🧠</div>
          <h1 style={{
            fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 32, margin: "0 0 5px",
            background: `linear-gradient(135deg,#fff,${C.neon},${C.cyan})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundSize: "200% auto", animation: "shimmer 4s linear infinite"
          }}>MindMate</h1>
          <p style={{ fontSize: 11, color: C.sub, letterSpacing: ".18em", textTransform: "uppercase", fontFamily: "'Nunito',sans-serif", fontWeight: 300 }}>Reflect · Evolve · Connect</p>
        </div>
        {children}
      </div>
    </div>
  </div>
)
