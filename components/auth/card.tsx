import { useState } from 'react'
import { MindMateColors as C } from '@/constants/theme'

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
