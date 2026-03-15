import { MindMateColors as C } from '@/constants/theme'

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
