import { Platform } from 'react-native';

export const Colors = {
  primary: '#8B5CF6',       // violet-500
  primaryLight: '#A78BFA',  // violet-400
  primaryDark: '#6D28D9',   // violet-700
  secondary: '#06B6D4',     // cyan-500
  accent: '#F59E0B',        // amber-500
  danger: '#EF4444',        // red-500
  success: '#10B981',       // emerald-500
  warning: '#F97316',       // orange-500

  dark: {
    bg: '#0D0D14',
    surface: '#13131F',
    card: '#1A1A2E',
    border: '#2A2A45',
    muted: '#3B3B5C',
    text: '#F0EEFF',
    textSecondary: '#9B9BC0',
    textMuted: '#5C5C8A',
  },

  gradient: {
    primary: ['#8B5CF6', '#6D28D9'] as const,
    secondary: ['#06B6D4', '#0891B2'] as const,
    danger: ['#EF4444', '#DC2626'] as const,
    card: ['#1A1A2E', '#13131F'] as const,
    journal: ['#8B5CF6', '#EC4899'] as const,
    insights: ['#06B6D4', '#8B5CF6'] as const,
    panic: ['#EF4444', '#F97316'] as const,
    plugins: ['#10B981', '#06B6D4'] as const,
  },

  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#8B5CF6',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#8B5CF6',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const MindMateColors = {
  void: "#04060F",
  deep: "#080C1A",
  surface: "#0C1020",
  lift: "#111827",
  card: "#141C30",
  border: "rgba(148,163,184,0.08)",
  neon: "#A78BFA",
  cyan: "#34D399",
  rose: "#F87171",
  amber: "#FBBF24",
  lime: "#86EFAC",
  pink: "#F472B6",
  blue: "#60A5FA",
  text: "#F8FAFF",
  sub: "#94A3B8",
  muted: "#3D4F6A",
  a1: "#6D28D9",
  a2: "#0F766E",
  a3: "#9F1239",
  a4: "#1D4ED8",
};
