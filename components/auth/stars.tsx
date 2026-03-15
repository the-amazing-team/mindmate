import { useRef } from 'react'
import { MindMateColors as C } from '@/constants/theme'

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
