// Light theme colors (matching global.css)
export const lightColors = {
  background: '#f8fdf9',
  foreground: '#1a2e1f',
  card: '#ffffff',
  cardForeground: '#1a2e1f',
  popover: '#ffffff',
  popoverForeground: '#1a2e1f',
  primary: '#22c55e',
  primaryForeground: '#f8fdf9',
  secondary: '#f0fdf4',
  secondaryForeground: '#1a2e1f',
  muted: '#f0fdf4',
  mutedForeground: '#6b7280',
  accent: '#dcfce7',
  accentForeground: '#1a2e1f',
  destructive: '#ef4444',
  destructiveForeground: '#f8fdf9',
  border: '#e5e7eb',
  input: '#e5e7eb',
  ring: '#22c55e',
};

// Dark theme colors (matching global.css)
export const darkColors = {
  background: '#0a1f0d',
  foreground: '#f0fdf4',
  card: '#132f18',
  cardForeground: '#f0fdf4',
  popover: '#132f18',
  popoverForeground: '#f0fdf4',
  primary: '#4ade80',
  primaryForeground: '#0a1f0d',
  secondary: '#1a3d1f',
  secondaryForeground: '#f0fdf4',
  muted: '#1a3d1f',
  mutedForeground: '#9ca3af',
  accent: '#1f4d24',
  accentForeground: '#f0fdf4',
  destructive: '#b91c1c',
  destructiveForeground: '#f0fdf4',
  border: '#2a4d2f',
  input: '#2a4d2f',
  ring: '#4ade80',
};

export const colors = {
  light: lightColors,
  dark: darkColors,
};

export function getColors(isDark: boolean) {
  return isDark ? darkColors : lightColors;
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
