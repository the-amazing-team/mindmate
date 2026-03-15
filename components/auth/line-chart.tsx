import { MindMateColors as C } from '@/constants/theme'

export const LineChart = ({ data, color = C.neon }: { data: (number | null)[], color?: string }) => {
  const clean = data.map(v => v === null ? null : Math.min(Math.max(v, 0), 4));
  const valid = clean.filter(v => v !== null);
  if (valid.length < 2) return <div style={{ height: 58, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 12 }}>Not enough data yet</div>;
  const W = 300, H = 58, max = 4, pad = 4;
  const pts = clean.map((v, i) => v === null ? null : [((i / (clean.length - 1)) * (W - pad * 2)) + pad, H - pad - ((v / max) * (H - pad * 2))]);
  const validPts = (pts.filter(Boolean) as number[][]);
  const poly = validPts.map(p => p.join(",")).join(" ");
  const area = `${validPts[0][0]},${H} ${poly} ${validPts[validPts.length - 1][0]},${H}`;
  const uid = color.replace("#", "");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: 58, overflow: "visible" }}>
      <defs>
        <linearGradient id={`g${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#g${uid})`} />
      <polyline points={poly} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      {validPts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3.2" fill={color} stroke={C.surface} strokeWidth="2"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
      ))}
    </svg>
  );
}
