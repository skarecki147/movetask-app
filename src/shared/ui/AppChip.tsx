import type { PressableProps } from 'react-native';
import { Pressable, StyleSheet } from 'react-native';

import { useMovetaskTheme } from '@/shared/theme/ThemeContext';
import { tokens } from '@/shared/theme/tokens';

import { AppText } from './AppText';

type Props = PressableProps & {
  label: string;
  selected?: boolean;
};

export function AppChip({ label, selected, style, ...rest }: Props) {
  const { colors } = useMovetaskTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={(state) => [
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      <AppText
        variant="caption"
        style={{ color: selected ? colors.primaryText : colors.text }}
        numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: tokens.spacing.sm,
    marginBottom: tokens.spacing.sm,
  },
});
