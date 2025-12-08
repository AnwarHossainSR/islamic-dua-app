import type React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Card, CardContent } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
}

export function StatCard({ title, value, description, icon }: StatCardProps) {
  const { colors } = useTheme();

  return (
    <Card>
      <CardContent style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.mutedForeground }]}>{title}</Text>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
        </View>
        <Text style={[styles.value, { color: colors.cardForeground }]}>{value}</Text>
        {description && (
          <Text style={[styles.description, { color: colors.mutedForeground }]}>{description}</Text>
        )}
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
  },
  iconContainer: {
    opacity: 0.7,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
  },
});
