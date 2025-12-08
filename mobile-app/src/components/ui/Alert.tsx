import type React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive';
  title?: string;
  style?: ViewStyle;
}

export function Alert({ children, variant = 'default', title, style }: AlertProps) {
  const { colors } = useTheme();

  const getBorderColor = () => {
    return variant === 'destructive' ? colors.destructive : colors.border;
  };

  const getBackgroundColor = () => {
    if (variant === 'destructive') {
      return `${colors.destructive}15`; // 15 = ~9% opacity
    }
    return colors.background;
  };

  return (
    <View
      style={[
        styles.alert,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
        style,
      ]}
    >
      {title && (
        <Text
          style={[
            styles.title,
            {
              color: variant === 'destructive' ? colors.destructive : colors.foreground,
            },
          ]}
        >
          {title}
        </Text>
      )}
      {typeof children === 'string' ? (
        <Text style={[styles.description, { color: colors.mutedForeground }]}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  alert: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});
