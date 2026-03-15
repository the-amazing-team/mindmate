import { MindMateColors as C } from '@/constants/theme'

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
