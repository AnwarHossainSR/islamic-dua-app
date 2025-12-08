import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface LoaderProps {
  size?: "small" | "large";
  color?: string;
  fullScreen?: boolean;
}

export function Loader({ size = "large", color, fullScreen = false }: LoaderProps) {
  const { colors } = useTheme();

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
        <ActivityIndicator size={size} color={color || colors.primary} />
      </View>
    );
  }

  return <ActivityIndicator size={size} color={color || colors.primary} />;
}

export function FullPageLoader() {
  const { colors } = useTheme();
  return (
    <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
