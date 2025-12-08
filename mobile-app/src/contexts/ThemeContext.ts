import { createContext } from 'react';
import type { colors } from '@/lib/theme';

type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  isDark: boolean;
  colors: typeof colors.light;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
