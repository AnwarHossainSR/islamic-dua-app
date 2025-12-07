import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { StyleSheet, Text, TextStyle } from "react-native";

interface LabelProps {
  children: React.ReactNode;
  style?: TextStyle;
  required?: boolean;
}

export function Label({ children, style, required }: LabelProps) {
  const { colors } = useTheme();

  return (
    <Text style={[styles.label, { color: colors.foreground }, style]}>
      {children}
      {required && <Text style={{ color: colors.destructive }}> *</Text>}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
});
