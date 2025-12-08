import { StyleSheet, View } from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface ProgressProps {
  value: number;
  max?: number;
  height?: number;
}

export function Progress({ value, max = 100, height = 8 }: ProgressProps) {
  const { colors } = useTheme();
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.secondary,
          height,
        },
      ]}
    >
      <View
        style={[
          styles.progress,
          {
            backgroundColor: colors.primary,
            width: `${percentage}%`,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 9999,
    overflow: "hidden",
  },
  progress: {
    height: "100%",
    borderRadius: 9999,
  },
});
