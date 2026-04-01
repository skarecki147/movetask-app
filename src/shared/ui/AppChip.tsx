import type { PressableProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { chipSelectedGradient, gradientStops } from '@/shared/theme/gradients';
import { neonChromeOutline } from '@/shared/theme/neon';
import { useMovetaskTheme } from '@/shared/theme/ThemeContext';
import { tokens } from '@/shared/theme/tokens';

import { AppText } from './AppText';

type Props = PressableProps & {
  label: string;
  selected?: boolean;
};

export function AppChip({ label, selected, style, ...rest }: Props) {
  const { colors, resolved } = useMovetaskTheme();

  if (selected) {
    const grad = chipSelectedGradient(resolved);
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        style={(state) => [styles.chipShell, typeof style === 'function' ? style(state) : style]}
        {...rest}
      >
        <LinearGradient
          colors={gradientStops(grad)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.chipInner}>
          <AppText variant="caption" style={{ color: colors.primaryText }} numberOfLines={1}>
            {label}
          </AppText>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={(state) => [
        styles.chip,
        neonChromeOutline(resolved),
        { backgroundColor: colors.surface },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      <AppText variant="caption" style={{ color: colors.text }} numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chipShell: {
    borderRadius: tokens.radius.full,
    overflow: 'hidden',
    marginRight: tokens.spacing.sm,
    marginBottom: tokens.spacing.sm,
    borderWidth: 0,
  },
  chipInner: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
  },
  chip: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.full,
    marginRight: tokens.spacing.sm,
    marginBottom: tokens.spacing.sm,
  },
});
