import { MindMateColors as C } from '@/constants/theme'

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
