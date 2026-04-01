import { useEffect, useState } from 'react';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Modal, Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMovetaskTheme } from '@/shared/theme/ThemeContext';
import { tokens } from '@/shared/theme/tokens';

import { AppText } from './AppText';

type Props = {
  visible: boolean;
  date: Date;
  onConfirm: (selected: Date) => void;
  onDismiss: () => void;
};

export function DueDatePickerModal({ visible, date, onConfirm, onDismiss }: Props) {
  const { colors, resolved } = useMovetaskTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [pending, setPending] = useState(date);

  useEffect(() => {
    if (visible) setPending(date);
  }, [visible, date]);

  const handleAndroidChange = (event: DateTimePickerEvent, selected?: Date) => {
    onDismiss();
    if (event.type === 'set' && selected) onConfirm(selected);
  };

  if (Platform.OS === 'android') {
    return visible ? (
      <DateTimePicker
        mode="date"
        value={pending}
        display="default"
        onChange={handleAndroidChange}
      />
    ) : null;
  }

  if (Platform.OS === 'web') return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay} pointerEvents="box-none">
        <Pressable
          style={styles.backdrop}
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss date picker"
        />
        <View
          style={[
            styles.sheet,
            {
              width: windowWidth,
              alignSelf: 'center',
              backgroundColor: colors.surface,
              borderColor: colors.border,
              paddingBottom: Math.max(insets.bottom, tokens.spacing.md),
            },
          ]}
        >
          <View style={styles.toolbar}>
            <Pressable onPress={onDismiss} hitSlop={12}>
              <AppText variant="label" style={{ color: colors.primary }}>
                Cancel
              </AppText>
            </Pressable>
            <Pressable
              onPress={() => {
                onConfirm(pending);
                onDismiss();
              }}
              hitSlop={12}
            >
              <AppText variant="label" style={{ color: colors.primary }}>
                Done
              </AppText>
            </Pressable>
          </View>
          <View style={[styles.pickerHost, { width: windowWidth }]}>
            <DateTimePicker
              mode="date"
              value={pending}
              display="spinner"
              themeVariant={resolved === 'dark' ? 'dark' : 'light'}
              textColor={colors.text}
              onChange={(_event, selected) => {
                if (selected) setPending(selected);
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: tokens.radius.lg,
    borderTopRightRadius: tokens.radius.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: tokens.spacing.sm,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.md,
    marginBottom: tokens.spacing.xs,
  },
  pickerHost: {
    alignSelf: 'center',
    alignItems: 'center',
    paddingVertical: tokens.spacing.sm,
  },
});
