import { useState } from 'react'
import { MindMateColors as C } from '@/constants/theme'

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
