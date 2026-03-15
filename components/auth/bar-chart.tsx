import { MindMateColors as C } from '@/constants/theme'

export const BarChart = ({ data }: { data: (number | null)[] }) => {
  const valid = (data.filter(v => v !== null) as number[]);
  const max = Math.max(...valid, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 72 }}>
      {data.map((v, i) => {
        if (v === null) return <div key={i} style={{ flex: 1, height: 72, display: "flex", alignItems: "flex-end" }}><div style={{ width: "100%", height: 4, borderRadius: "2px 2px 0 0", background: "rgba(255,255,255,.04)" }} /></div>;
        const h = Math.round((v / max) * 66);
        const top = v === max;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: 72 }}>
            <div style={{
              width: "100%", borderRadius: "5px 5px 0 0", height: h,
              background: top ? `linear-gradient(180deg,${C.neon},${C.a1})` : `linear-gradient(180deg,${C.neon}50,${C.a1}30)`,
              boxShadow: top ? `0 -3px 14px ${C.neon}55` : "none",
              transition: "height .7s cubic-bezier(.34,1.56,.64,1)"
            }} />
          </div>
        );
      })}
    </div>
  );
}
