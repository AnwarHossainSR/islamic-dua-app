import type React from "react";
import { StyleSheet, Text, type TextStyle, View, type ViewStyle } from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardHeader({ children, style }: CardHeaderProps) {
  return <View style={[styles.cardHeader, style]}>{children}</View>;
}

interface CardTitleProps {
  children: React.ReactNode;
  style?: TextStyle;
}

export function CardTitle({ children, style }: CardTitleProps) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.cardTitle, { color: colors.cardForeground }, style]}>{children}</Text>
  );
}

interface CardDescriptionProps {
  children: React.ReactNode;
  style?: TextStyle;
}

export function CardDescription({ children, style }: CardDescriptionProps) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.cardDescription, { color: colors.mutedForeground }, style]}>
      {children}
    </Text>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardContent({ children, style }: CardContentProps) {
  return <View style={[styles.cardContent, style]}>{children}</View>;
}

interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardFooter({ children, style }: CardFooterProps) {
  return <View style={[styles.cardFooter, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    padding: 16,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 0,
  },
});
