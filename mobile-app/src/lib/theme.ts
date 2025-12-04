// Light theme colors (converted from oklch to hex)
export const lightColors = {
  background: "#f9faf9",
  foreground: "#1c1f1c",
  card: "#ffffff",
  cardForeground: "#1c1f1c",
  popover: "#ffffff",
  popoverForeground: "#1c1f1c",
  primary: "#2d8a5d",
  primaryForeground: "#f9faf9",
  secondary: "#f2f4f2",
  secondaryForeground: "#1c1f1c",
  muted: "#f2f4f2",
  mutedForeground: "#6b7268",
  accent: "#e0f0e5",
  accentForeground: "#1c1f1c",
  destructive: "#ef4444",
  destructiveForeground: "#f9faf9",
  border: "#e0e2e0",
  input: "#e0e2e0",
  ring: "#2d8a5d",
};

// Dark theme colors (converted from oklch to hex)
export const darkColors = {
  background: "#151915",
  foreground: "#eff0ef",
  card: "#1c201c",
  cardForeground: "#eff0ef",
  popover: "#1c201c",
  popoverForeground: "#eff0ef",
  primary: "#3da06d",
  primaryForeground: "#151915",
  secondary: "#2a302a",
  secondaryForeground: "#eff0ef",
  muted: "#2a302a",
  mutedForeground: "#9aa098",
  accent: "#364036",
  accentForeground: "#eff0ef",
  destructive: "#dc2626",
  destructiveForeground: "#eff0ef",
  border: "#364036",
  input: "#364036",
  ring: "#3da06d",
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
  "2xl": 48,
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
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
};

export const fontWeight = {
  normal: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};
