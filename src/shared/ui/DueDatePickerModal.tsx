import { useEffect, useMemo, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
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

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

const monthLabel = (d: Date) => d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

function buildCalendarGrid(monthDate: Date): Date[] {
  const first = startOfMonth(monthDate);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return day;
  });
}

export function DueDatePickerModal({ visible, date, onConfirm, onDismiss }: Props) {
  const { colors, resolved } = useMovetaskTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [pending, setPending] = useState(date);
  const [monthCursor, setMonthCursor] = useState(startOfMonth(date));

  useEffect(() => {
    if (visible) {
      setPending(date);
      setMonthCursor(startOfMonth(date));
    }
  }, [visible, date]);

  const androidGrid = useMemo(() => buildCalendarGrid(monthCursor), [monthCursor]);

  if (Platform.OS === 'android') {
    return visible ? (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        onRequestClose={onDismiss}
      >
        <View style={styles.overlay}>
          <Pressable
            style={styles.backdrop}
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Dismiss date picker"
          />
          <View
            style={[
              styles.androidCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                width: Math.min(windowWidth - tokens.spacing.lg * 2, 360),
                marginBottom: Math.max(insets.bottom, tokens.spacing.lg),
              },
            ]}
          >
            <View style={styles.androidMonthNav}>
              <Pressable
                onPress={() =>
                  setMonthCursor((curr) => new Date(curr.getFullYear(), curr.getMonth() - 1, 1))
                }
                hitSlop={12}
              >
                <AppText variant="title">{'<'}</AppText>
              </Pressable>
              <AppText variant="label">{monthLabel(monthCursor)}</AppText>
              <Pressable
                onPress={() =>
                  setMonthCursor((curr) => new Date(curr.getFullYear(), curr.getMonth() + 1, 1))
                }
                hitSlop={12}
              >
                <AppText variant="title">{'>'}</AppText>
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAY_LABELS.map((w, idx) => (
                <View key={`${w}-${idx}`} style={styles.dayCell}>
                  <AppText variant="caption" muted>
                    {w}
                  </AppText>
                </View>
              ))}
            </View>

            <View style={styles.daysWrap}>
              {androidGrid.map((d) => {
                const inMonth = d.getMonth() === monthCursor.getMonth();
                const selected = sameDay(d, pending);
                return (
                  <Pressable
                    key={d.toISOString()}
                    onPress={() => setPending(d)}
                    style={styles.dayCell}
                  >
                    <View
                      style={[
                        styles.dayBubble,
                        selected ? { backgroundColor: colors.primary } : undefined,
                      ]}
                    >
                      <AppText
                        variant="body"
                        muted={!inMonth && !selected}
                        style={[
                          styles.dayText,
                          selected ? { color: colors.primaryText, fontWeight: '700' } : undefined,
                        ]}
                      >
                        {d.getDate()}
                      </AppText>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.androidActions}>
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
                  OK
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  androidCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: tokens.radius.lg,
    paddingTop: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.md,
    alignSelf: 'center',
  },
  androidMonthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.sm,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: tokens.spacing.xs,
  },
  daysWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: tokens.spacing.xs,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  androidActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: tokens.spacing.lg,
    paddingTop: 0,
    paddingBottom: tokens.spacing.md,
  },
});
