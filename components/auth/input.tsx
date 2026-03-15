import { useState } from 'react'
import { MindMateColors as C } from '@/constants/theme'

export const Input = ({ label, type = "text", value, onChange, placeholder, error, icon, show, onToggleShow, autoComplete, required }: { label?: string, type?: string, value: string, onChange: (e: any) => void, placeholder?: string, error?: string, icon?: string, show?: boolean, onToggleShow?: () => void, autoComplete?: string, required?: boolean }) => {
  const [focused, setFocused] = useState(false);
  const isPass = type === "password";
  return (
    <div style={{ marginBottom: 4 }}>
      {label && <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.sub, letterSpacing: ".12em", textTransform: "uppercase", fontFamily: "'Syne',sans-serif", marginBottom: 7 }}>{label}</label>}
      <div style={{ position: "relative" }}>
        {icon && <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 15, opacity: .55, pointerEvents: "none" }}>{icon}</div>}
        <input type={isPass && show ? "text" : type} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          autoComplete={autoComplete} required={required}
          style={{
            width: "100%", padding: `12px ${isPass ? "42px" : "13px"} 12px ${icon ? "40px" : "13px"}`, borderRadius: 13,
            background: focused ? `${C.lift}CC` : `${C.lift}88`,
            border: `1.5px solid ${error ? C.rose + "88" : focused ? C.neon + "66" : "rgba(255,255,255,.08)"}`,
            color: C.text, fontSize: 14, outline: "none", transition: "all .2s", boxSizing: "border-box"
          }} />
        {isPass && <button type="button" onClick={onToggleShow} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.sub, fontSize: 15, padding: 0 }}>{show ? "🙈" : "👁"}</button>}
      </div>
      {error && <p style={{ margin: "4px 0 0", fontSize: 11, color: C.rose, fontFamily: "'Nunito',sans-serif", animation: "fadeUp .2s both" }}>{error}</p>}
    </div>
  );
}
