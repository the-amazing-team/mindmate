import { MindMateColors as C } from '@/constants/theme'

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
