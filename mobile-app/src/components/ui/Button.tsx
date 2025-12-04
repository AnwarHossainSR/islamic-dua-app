import { useTheme } from "@/hooks/useTheme";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
}

export function Button({
  children,
  onPress,
  variant = "default",
  size = "default",
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const { colors } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return colors.muted;
    switch (variant) {
      case "default":
        return "#22c55e"; // Always use solid green
      case "destructive":
        return "#ef4444"; // Solid red
      case "secondary":
        return colors.secondary;
      case "outline":
        return "transparent";
      case "ghost":
        return "transparent";
      case "link":
        return "transparent";
      default:
        return "#22c55e";
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.mutedForeground;
    switch (variant) {
      case "default":
        return colors.primaryForeground;
      case "destructive":
        return colors.destructiveForeground;
      case "secondary":
        return colors.secondaryForeground;
      case "outline":
        return colors.foreground;
      case "ghost":
        return colors.foreground;
      case "link":
        return colors.primary;
      default:
        return colors.primaryForeground;
    }
  };

  const getBorderColor = () => {
    switch (variant) {
      case "outline":
        return colors.border;
      default:
        return "transparent";
    }
  };

  const getHeight = () => {
    switch (size) {
      case "sm":
        return 36;
      case "lg":
        return 44;
      case "icon":
        return 40;
      default:
        return 40;
    }
  };

  const getPadding = () => {
    switch (size) {
      case "sm":
        return 12;
      case "lg":
        return 24;
      case "icon":
        return 8;
      default:
        return 16;
    }
  };

  const textColor = getTextColor();

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={textColor} size="small" />;
    }

    if (typeof children === "string") {
      return (
        <Text
          style={[
            styles.text,
            {
              color: textColor,
              fontSize: size === "sm" ? 13 : 14,
              textDecorationLine: variant === "link" ? "underline" : "none",
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      );
    }

    // For mixed content (icons + text), we need to wrap string children in Text
    return React.Children.map(children, (child) => {
      if (typeof child === "string") {
        return (
          <Text
            style={[
              styles.text,
              {
                color: textColor,
                fontSize: size === "sm" ? 13 : 14,
                textDecorationLine: variant === "link" ? "underline" : "none",
              },
              textStyle,
            ]}
          >
            {child}
          </Text>
        );
      }
      return child;
    });
  };

  // Flatten the passed style to extract values
  const flattenedStyle = style ? StyleSheet.flatten(style) : ({} as ViewStyle);
  const { backgroundColor: customBgColor, ...restStyle } =
    flattenedStyle as ViewStyle & { backgroundColor?: string };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: customBgColor || getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === "outline" ? 1 : 0,
          height: getHeight(),
          paddingHorizontal: getPadding(),
          opacity: pressed ? 0.8 : 1,
        },
        restStyle,
      ]}
    >
      {renderContent()}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    gap: 8,
  },
  text: {
    fontWeight: "500",
  },
});
