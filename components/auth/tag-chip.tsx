import { MindMateColors as C } from '@/constants/theme'

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
