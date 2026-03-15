import { MindMateColors as C } from '@/constants/theme'

export const BackBtn = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} style={{
    background: "none", border: "none", cursor: "pointer",
    color: C.sub, fontSize: 13, fontFamily: "'Nunito',sans-serif",
    display: "flex", alignItems: "center", gap: 5, padding: 0
  }}>← Back</button>
)
