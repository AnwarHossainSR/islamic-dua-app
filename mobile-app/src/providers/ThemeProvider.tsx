import AsyncStorage from "@react-native-async-storage/async-storage";
import type React from "react";
import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { ThemeContext } from "@/contexts/ThemeContext";
import { getColors } from "@/lib/theme";

const THEME_STORAGE_KEY = "@app_theme";

type ThemeMode = "light" | "dark" | "system";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load saved theme preference
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved === "light" || saved === "dark" || saved === "system") {
        setThemeModeState(saved);
      }
      setIsLoaded(true);
    });
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  const isDark = themeMode === "system" ? systemColorScheme === "dark" : themeMode === "dark";

  const toggleTheme = () => {
    const newMode = isDark ? "light" : "dark";
    setThemeMode(newMode);
  };

  const themeColors = getColors(isDark);

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        colors: themeColors,
        themeMode,
        setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
