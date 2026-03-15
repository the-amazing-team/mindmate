import { MindMateColors as C } from '@/constants/theme'

export const Spinner = ({ size = 24, color = C.neon }: { size?: number, color?: string }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    border: `2px solid ${color}22`, borderTop: `2px solid ${color}`,
    animation: 'spin .8s linear infinite'
  }} />
)
