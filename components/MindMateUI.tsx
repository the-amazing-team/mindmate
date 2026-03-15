import { useState, useRef } from 'react'
import { MindMateColors as C } from '@/constants/MindMateTheme'

// --- FOUNDATIONS ---

export const Stars = ({ n = 16 }: { n?: number }) => {
  const stars = useRef(Array.from({ length: n }, (_, i) => ({
    x: Math.random() * 100, y: Math.random() * 100, s: 1 + Math.random() * 2.2,
    delay: Math.random() * 7, dur: 3 + Math.random() * 5,
    c: [C.neon, C.cyan, C.rose, C.amber, C.lime, C.pink][i % 6], op: .12 + Math.random() * .55,
  }))).current;

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {stars.map((s, i) => (
        <div key={i} style={{
          position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
          width: s.s, height: s.s, borderRadius: "50%", background: s.c, opacity: s.op,
          animation: `twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
          boxShadow: `0 0 ${s.s * 4}px ${s.c}`
        }} />
      ))}
    </div>
  )
}

export const Aurora = ({ colors = [C.a1, C.a2, C.a4] }: { colors?: string[] }) => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
    {colors.map((col, i) => (
      <div key={i} style={{
        position: "absolute", left: `${[10, 70, 42][i]}%`, top: `${[12, 50, 82][i]}%`,
        width: [210, 175, 155][i], height: [210, 175, 155][i], borderRadius: "50%",
        background: `radial-gradient(circle,${col}55 0%,${col}18 50%,transparent 75%)`,
        transform: "translate(-50%,-50%)",
        animation: `floatA ${9 + i * 2}s ${i * 2}s ease-in-out infinite`,
        filter: `blur(${[210, 175, 155][i] * 0.17}px)`,
      }} />
    ))}
  </div>
)

export const Screen = ({ children, aurora, stars = 14, scroll = true }: { children: React.ReactNode, aurora?: string[], stars?: number, scroll?: boolean }) => (
  <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
    {aurora && <Aurora colors={aurora} />}
    <Stars n={stars} />
    <div style={{
      position: "relative", zIndex: 1, flex: 1, overflowY: scroll ? "auto" : "hidden",
      display: "flex", flexDirection: "column"
    }}>
      {children}
    </div>
  </div>
)

// --- ATOMS ---

export const Card = ({ children, style = {}, onClick, delay = 0 }: { children: React.ReactNode, style?: any, onClick?: () => void, delay?: number }) => {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}
      style={{
        background: `linear-gradient(135deg,${C.lift}EE,${C.float}AA)`,
        borderRadius: 21, padding: 18,
        border: `1px solid ${hov && onClick ? C.neon + "44" : C.border}`,
        backdropFilter: "blur(16px)", position: "relative", overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        animation: `fadeUp .45s ${delay}s both`,
        transform: hov && onClick ? "translateY(-3px) scale(1.01)" : "translateY(0)",
        transition: "transform .25s,border-color .25s,box-shadow .25s",
        boxShadow: hov && onClick ? `0 14px 38px rgba(0,0,0,.5),0 0 0 1px ${C.neon}28` : `0 5px 18px rgba(0,0,0,.35)`,
        ...style,
      }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg,transparent,rgba(255,255,255,.09),transparent)`
      }} />
      {children}
    </div>
  )
}

export const Btn = ({ children, onClick, full, color = C.neon, variant = "primary", size = "md", disabled = false }: { children: React.ReactNode, onClick?: () => void, full?: boolean, color?: string, variant?: string, size?: string, disabled?: boolean }) => {
  const [p, setP] = useState(false);
  return (
    <button onMouseDown={() => setP(true)} onMouseUp={() => setP(false)}
      onMouseLeave={() => setP(false)} onClick={disabled ? undefined : onClick} disabled={disabled}
      style={{
        width: full ? "100%" : "auto",
        padding: size === "sm" ? "8px 15px" : "14px 22px",
        borderRadius: 14,
        background: variant === "primary" ? `linear-gradient(135deg,${C.a1},${color})`
          : variant === "outline" ? "transparent" : `${C.lift}CC`,
        border: variant === "outline" ? `1.5px solid ${color}44` : `1px solid rgba(255,255,255,.07)`,
        color: variant === "ghost" ? C.sub : "#fff",
        fontSize: size === "sm" ? 13 : 15, fontWeight: 700, fontFamily: "'Syne',sans-serif",
        cursor: disabled ? "not-allowed" : "pointer", letterSpacing: ".02em",
        transform: p ? "scale(.97)" : "scale(1)", transition: "all .15s", opacity: disabled ? .5 : 1,
        boxShadow: variant === "primary" ? `0 0 18px ${color}44,0 5px 18px rgba(0,0,0,.4)` : "none",
      }}>{children}</button>
  )
}

export const BackBtn = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} style={{
    background: "none", border: "none", cursor: "pointer",
    color: C.sub, fontSize: 13, fontFamily: "'Nunito',sans-serif",
    display: "flex", alignItems: "center", gap: 5, padding: 0
  }}>← Back</button>
)

export const ProgressDots = ({ step, total }: { step: number, total: number }) => (
  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{
        height: 4, borderRadius: 2,
        width: i < step ? 21 : 7,
        background: i < step ? `linear-gradient(90deg,${C.a1},${C.neon})` : C.muted,
        transition: "all .4s cubic-bezier(.34,1.56,.64,1)",
        boxShadow: i < step ? `0 0 7px ${C.neon}55` : "none"
      }} />
    ))}
  </div>
)

export const TagChip = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button onClick={onClick} style={{
    padding: "7px 12px", borderRadius: 18,
    border: `1.5px solid ${active ? C.neon : C.border}`,
    background: active ? `${C.neon}18` : "transparent",
    color: active ? C.neon : C.sub, fontSize: 12, fontWeight: 700,
    fontFamily: "'Nunito',sans-serif", cursor: "pointer", transition: "all .2s",
    transform: active ? "scale(1.04)" : "scale(1)",
    boxShadow: active ? `0 0 10px ${C.neon}33` : "none",
  }}>{label}</button>
)

// --- APP SHELL COMPONENTS ---

export const StatusBar = () => (
  <div style={{
    display: "flex", justifyContent: "space-between", padding: "10px 24px 2px",
    fontSize: 12, color: C.sub, fontFamily: "'Nunito',sans-serif", fontWeight: 700, flexShrink: 0
  }}>
    <span>9:41</span>
    <div style={{ width: 108, height: 25, borderRadius: 12, background: "rgba(0,0,0,.55)", border: "1px solid rgba(255,255,255,.07)" }} />
    <span>●●● 🔋</span>
  </div>
)

const NAV = [
  { id: "home", icon: "⌂", label: "Home" }, { id: "journal", icon: "✦", label: "Journal" },
  { id: "insights", icon: "◈", label: "Insights" }, { id: "chat", icon: "◎", label: "Chat" },
  { id: "checkin", icon: "♡", label: "Check-in" },
];
export const BottomNav = ({ active, onNav }: { active: string, onNav: (id: string) => void }) => (
  <div style={{
    display: "flex", background: C.void, borderTop: `1px solid rgba(192,132,252,.1)`,
    padding: "7px 4px 17px", flexShrink: 0
  }}>
    {NAV.map(it => {
      const on = active === it.id;
      return (
        <button key={it.id} onClick={() => onNav(it.id)} style={{
          flex: 1, background: "none", border: "none",
          cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
          padding: "5px 0", position: "relative"
        }}>
          {on && <div style={{
            position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
            width: 26, height: 2, borderRadius: 1,
            background: `linear-gradient(90deg,${C.a1},${C.neon})`, boxShadow: `0 0 7px ${C.neon}`
          }} />}
          <div style={{
            width: 35, height: 35, borderRadius: 11,
            background: on ? `linear-gradient(135deg,${C.a1}33,${C.neon}22)` : "transparent",
            border: on ? `1px solid ${C.neon}28` : "1px solid transparent",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
            transition: "all .3s", boxShadow: on ? `0 0 12px ${C.neon}28` : "none",
            filter: on ? `drop-shadow(0 0 5px ${C.neon})` : "none"
          }}>
            {it.icon}
          </div>
          <span style={{
            fontSize: 9, fontFamily: "'Syne',sans-serif", fontWeight: 700,
            color: on ? C.neon : C.muted, letterSpacing: ".06em", textTransform: "uppercase",
            transition: "color .3s"
          }}>{it.label}</span>
        </button>
      );
    })}
  </div>
)

// --- CHARTS ---

export const LineChart = ({ data, color = C.neon }: { data: (number | null)[], color?: string }) => {
  const clean = data.map(v => v === null ? null : Math.min(Math.max(v, 0), 4));
  const valid = clean.filter(v => v !== null);
  if (valid.length < 2) return <div style={{ height: 58, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 12 }}>Not enough data yet</div>;
  const W = 300, H = 58, max = 4, pad = 4;
  const pts = clean.map((v, i) => v === null ? null : [((i / (clean.length - 1)) * (W - pad * 2)) + pad, H - pad - ((v / max) * (H - pad * 2))]);
  const validPts = (pts.filter(Boolean) as number[][]);
  const poly = validPts.map(p => p.join(",")).join(" ");
  const area = `${validPts[0][0]},${H} ${poly} ${validPts[validPts.length - 1][0]},${H}`;
  const uid = color.replace("#", "");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: 58, overflow: "visible" }}>
      <defs>
        <linearGradient id={`g${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#g${uid})`} />
      <polyline points={poly} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      {validPts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3.2" fill={color} stroke={C.surface} strokeWidth="2"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
      ))}
    </svg>
  );
}

export const BarChart = ({ data }: { data: (number | null)[] }) => {
  const valid = (data.filter(v => v !== null) as number[]);
  const max = Math.max(...valid, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 72 }}>
      {data.map((v, i) => {
        if (v === null) return <div key={i} style={{ flex: 1, height: 72, display: "flex", alignItems: "flex-end" }}><div style={{ width: "100%", height: 4, borderRadius: "2px 2px 0 0", background: "rgba(255,255,255,.04)" }} /></div>;
        const h = Math.round((v / max) * 66);
        const top = v === max;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: 72 }}>
            <div style={{
              width: "100%", borderRadius: "5px 5px 0 0", height: h,
              background: top ? `linear-gradient(180deg,${C.neon},${C.a1})` : `linear-gradient(180deg,${C.neon}50,${C.a1}30)`,
              boxShadow: top ? `0 -3px 14px ${C.neon}55` : "none",
              transition: "height .7s cubic-bezier(.34,1.56,.64,1)"
            }} />
          </div>
        );
      })}
    </div>
  );
}

// --- AUTH UI COMPONENTS ---

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

export const Input = ({ label, type = "text", value, onChange, placeholder, error, icon, show, onToggleShow, autoComplete, required }: { label?: string, type?: string, value: string, onChange: (e: any) => void, placeholder?: string, error?: string, icon?: string, show?: boolean, onToggleShow?: () => void, autoComplete?: string, required?: boolean }) => {
  const [focused, setFocused] = useState(false);
  const isPass = type === "password";
  return (
    <div style={{ marginBottom: 4 }}>
      {label && <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.sub, letterSpacing: ".12em", textTransform: "uppercase", fontFamily: "'Syne',sans-serif", marginBottom: 7 }}>{label}</label>}
      <div style={{ position: "relative" }}>
        {icon && <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 15, opacity: .55, pointerEvents: "none" }}>{icon}</div>}
        <input type={isPass && show ? "text" : type} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          autoComplete={autoComplete} required={required}
          style={{
            width: "100%", padding: `12px ${isPass ? "42px" : "13px"} 12px ${icon ? "40px" : "13px"}`, borderRadius: 13,
            background: focused ? `${C.lift}CC` : `${C.lift}88`,
            border: `1.5px solid ${error ? C.rose + "88" : focused ? C.neon + "66" : "rgba(255,255,255,.08)"}`,
            color: C.text, fontSize: 14, outline: "none", transition: "all .2s", boxSizing: "border-box"
          }} />
        {isPass && <button type="button" onClick={onToggleShow} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.sub, fontSize: 15, padding: 0 }}>{show ? "🙈" : "👁"}</button>}
      </div>
      {error && <p style={{ margin: "4px 0 0", fontSize: 11, color: C.rose, fontFamily: "'Nunito',sans-serif", animation: "fadeUp .2s both" }}>{error}</p>}
    </div>
  );
}

export const GoogleBtn = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} style={{ width: "100%", padding: "12px", borderRadius: 13, background: `${C.lift}CC`, border: `1px solid rgba(255,255,255,.1)`, color: C.text, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, fontFamily: "'Nunito',sans-serif", marginBottom: 16 }}>
    <svg width="17" height="17" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
    Continue with Google
  </button>
)

export const Divider = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 11, margin: "4px 0 14px" }}>
    <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.06)" }} />
    <span style={{ fontSize: 11, color: C.muted, fontFamily: "'Nunito',sans-serif" }}>or</span>
    <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.06)" }} />
  </div>
)

export const Toast = ({ msg, type = 'ok', onClear }: { msg: string, type?: "ok" | "err" | "warn" | "info", onClear: () => void }) => {
  if (!msg) return null
  return (
    <div style={{
      position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
      padding: '10px 18px', borderRadius: 14, background: `${C.lift}EE`,
      border: `1px solid ${type === 'ok' ? C.lime + '44' : type === 'err' ? C.rose + '44' : C.amber + '44'}`,
      fontSize: 13, color: C.text, fontFamily: "'Nunito',sans-serif",
      backdropFilter: 'blur(20px)', animation: 'fadeUp .3s both',
      display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 32px rgba(0,0,0,.5)'
    }}>
      <span>{type === 'ok' ? '✦' : type === 'err' ? '⚠️' : '🔔'}</span>
      <span>{msg}</span>
      <button onClick={onClear} style={{ background: 'none', border: 'none', color: C.sub, cursor: 'pointer', padding: '0 4px', fontSize: 16 }}>×</button>
    </div>
  )
}

export const Spinner = ({ size = 24, color = C.neon }: { size?: number, color?: string }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    border: `2px solid ${color}22`, borderTop: `2px solid ${color}`,
    animation: 'spin .8s linear infinite'
  }} />
)
