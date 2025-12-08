import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Button } from './Button';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  description: string;
  cancelText?: string;
  confirmText?: string;
  confirmVariant?: 'default' | 'destructive';
  icon?: 'warning' | 'info' | 'success' | 'error';
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const iconColors = {
  warning: '#f59e0b',
  info: '#3b82f6',
  success: '#22c55e',
  error: '#ef4444',
};

export function ConfirmationModal({
  visible,
  title,
  description,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  confirmVariant = 'default',
  icon = 'warning',
  onCancel,
  onConfirm,
  isLoading = false,
}: ConfirmationModalProps) {
  const { colors } = useTheme();

  const renderIcon = () => {
    const color = iconColors[icon];
    const size = 28;

    switch (icon) {
      case 'warning':
        return <AlertTriangle color={color} size={size} />;
      case 'info':
        return <Info color={color} size={size} />;
      case 'success':
        return <CheckCircle color={color} size={size} />;
      case 'error':
        return <XCircle color={color} size={size} />;
      default:
        return <AlertTriangle color={color} size={size} />;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable
          style={[styles.container, { backgroundColor: colors.card }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header with Icon */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>{renderIcon()}</View>
            <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
          </View>

          {/* Description */}
          <Text style={[styles.description, { color: colors.mutedForeground }]}>{description}</Text>

          {/* Actions */}
          <View style={styles.actions}>
            <Button variant="outline" onPress={onCancel} disabled={isLoading} style={styles.button}>
              {cancelText}
            </Button>
            <Button
              variant={confirmVariant === 'destructive' ? 'destructive' : 'default'}
              onPress={onConfirm}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
            >
              {confirmText}
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
