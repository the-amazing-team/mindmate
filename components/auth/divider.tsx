import { MindMateColors as C } from '@/constants/theme'

export const Divider = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 11, margin: "4px 0 14px" }}>
    <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.06)" }} />
    <span style={{ fontSize: 11, color: C.muted, fontFamily: "'Nunito',sans-serif" }}>or</span>
    <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.06)" }} />
  </div>
)
