import { Aurora } from './aurora'
import { Stars } from './stars'

export const Screen = ({ children, aurora, stars = 14, scroll = true }: { children: React.ReactNode, aurora?: string[], stars?: number, scroll?: boolean }) => (
  <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
    {aurora && <Aurora colors={aurora} />}
    <Stars n={stars} />
    <div style={{
      position: "relative", zIndex: 1, flex: 1, overflowY: scroll ? "auto" : "hidden",
      display: "flex", flexDirection: "column"
    }}>
      {children}
    </div>
  </div>
)
