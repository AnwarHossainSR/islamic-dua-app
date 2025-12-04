import { colors } from "@/lib/theme";
import { createContext } from "react";

type ThemeMode = "light" | "dark" | "system";

export interface ThemeContextType {
  isDark: boolean;
  colors: typeof colors.light;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);
