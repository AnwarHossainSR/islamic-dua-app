import { useTheme } from "@/hooks/useTheme";
import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
}

export function Badge({
  children,
  variant = "default",
  style,
  textStyle,
}: BadgeProps) {
  const { colors } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case "default":
        return colors.primary;
      case "secondary":
        return colors.secondary;
      case "destructive":
        return colors.destructive;
      case "outline":
        return "transparent";
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "default":
        return colors.primaryForeground;
      case "secondary":
        return colors.secondaryForeground;
      case "destructive":
        return colors.destructiveForeground;
      case "outline":
        return colors.foreground;
      default:
        return colors.primaryForeground;
    }
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: variant === "outline" ? colors.border : "transparent",
          borderWidth: variant === "outline" ? 1 : 0,
        },
        style,
      ]}
    >
      {typeof children === "string" ? (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    gap: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
  },
});
