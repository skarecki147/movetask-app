export const tokens = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 20,
    full: 9999,
  },
  typography: {
    caption: 12,
    label: 14,
    body: 16,
    title: 20,
    heading: 28,
  },
  zIndex: {
    base: 0,
    dropdown: 10,
    modal: 100,
  },
  animation: {
    fast: 150,
    normal: 250,
  },
} as const;

export type ColorPalette = {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryText: string;
  danger: string;
  success: string;
  tint: string;
};

export const lightColors: ColorPalette = {
  background: '#f4f5f7',
  surface: '#ffffff',
  text: '#111827',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  primary: '#2563eb',
  primaryText: '#ffffff',
  danger: '#dc2626',
  success: '#16a34a',
  tint: '#2563eb',
};

export const darkColors: ColorPalette = {
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  border: '#334155',
  primary: '#3b82f6',
  primaryText: '#ffffff',
  danger: '#f87171',
  success: '#4ade80',
  tint: '#3b82f6',
};
