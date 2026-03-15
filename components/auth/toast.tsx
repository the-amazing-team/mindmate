import { MindMateColors as C } from '@/constants/theme'

export const Toast = ({ msg, type = 'ok', onClear }: { msg: string, type?: "ok" | "err" | "warn" | "info", onClear: () => void }) => {
  if (!msg) return null
  return (
    <div style={{
      position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
      padding: '10px 18px', borderRadius: 14, background: `${C.lift}EE`,
      border: `1px solid ${type === 'ok' ? C.lime + '44' : type === 'err' ? C.rose + '44' : C.amber + '44'}`,
      fontSize: 13, color: C.text, fontFamily: "'Nunito',sans-serif",
      backdropFilter: 'blur(20px)', animation: 'fadeUp .3s both',
      display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 32px rgba(0,0,0,.5)'
    }}>
      <span>{type === 'ok' ? '✦' : type === 'err' ? '⚠️' : '🔔'}</span>
      <span>{msg}</span>
      <button onClick={onClear} style={{ background: 'none', border: 'none', color: C.sub, cursor: 'pointer', padding: '0 4px', fontSize: 16 }}>×</button>
    </div>
  )
}
