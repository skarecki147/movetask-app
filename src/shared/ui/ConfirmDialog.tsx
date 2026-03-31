import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { useMovetaskTheme } from '@/shared/theme/ThemeContext';
import { tokens } from '@/shared/theme/tokens';

import { AppButton } from './AppButton';
import { AppText } from './AppText';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLoading?: boolean;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  confirmLoading,
}: Props) {
  const { colors } = useMovetaskTheme();

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
        />
        <View
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          accessibilityRole="alert"
          onStartShouldSetResponder={() => true}>
          <AppText variant="title" style={styles.title}>
            {title}
          </AppText>
          <AppText variant="body" muted style={styles.message}>
            {message}
          </AppText>
          <View style={styles.actions}>
            <AppButton title={cancelLabel} variant="ghost" onPress={onCancel} disabled={confirmLoading} />
            <AppButton
              title={confirmLabel}
              variant="danger"
              onPress={onConfirm}
              loading={confirmLoading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: tokens.spacing.lg,
  },
  card: {
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    zIndex: 1,
    maxWidth: '100%',
  },
  title: { marginBottom: tokens.spacing.sm },
  message: { marginBottom: tokens.spacing.md },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', gap: tokens.spacing.sm },
});
