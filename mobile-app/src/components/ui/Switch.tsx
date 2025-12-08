import { Switch as RNSwitch, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Switch({ value, onValueChange, label, disabled = false, style }: SwitchProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>}
      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: colors.muted,
          true: colors.primary,
        }}
        thumbColor={colors.background}
        ios_backgroundColor={colors.muted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});
