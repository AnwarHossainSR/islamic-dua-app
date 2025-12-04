import { useTheme } from "@/hooks/useTheme";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";

interface TextareaProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  rows?: number;
}

export function Textarea({
  label,
  error,
  containerStyle,
  style,
  rows = 4,
  ...props
}: TextareaProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.foreground }]}>
          {label}
        </Text>
      )}
      <TextInput
        multiline
        numberOfLines={rows}
        textAlignVertical="top"
        style={[
          styles.input,
          {
            backgroundColor: colors.background,
            borderColor: error ? colors.destructive : colors.border,
            color: colors.foreground,
            minHeight: rows * 24 + 24,
          },
          style,
        ]}
        placeholderTextColor={colors.mutedForeground}
        {...props}
      />
      {error && (
        <Text style={[styles.error, { color: colors.destructive }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    marginTop: 2,
  },
});
