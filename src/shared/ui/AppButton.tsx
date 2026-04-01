import type { PressableProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, ActivityIndicator, View } from 'react-native';

import {
  dangerButtonGradient,
  gradientStops,
  primaryButtonGradient,
  secondaryButtonGradient,
} from '@/shared/theme/gradients';
import { neonChromeOutline } from '@/shared/theme/neon';
import { useMovetaskTheme } from '@/shared/theme/ThemeContext';
import { tokens } from '@/shared/theme/tokens';

import { AppText } from './AppText';

type Props = PressableProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
};

export function AppButton({
  title,
  variant = 'primary',
  loading,
  disabled,
  style,
  ...rest
}: Props) {
  const { colors, resolved } = useMovetaskTheme();
  const isDisabled = disabled || loading;

  const textColor =
    variant === 'primary' || variant === 'danger' ? colors.primaryText : colors.text;

  if (variant === 'secondary') {
    const grad = secondaryButtonGradient(resolved, colors);
    return (
      <Pressable
        accessibilityRole="button"
        disabled={isDisabled}
        style={(state) => [
          styles.gradientShell,
          neonChromeOutline(resolved),
          {
            opacity: state.pressed ? 0.9 : isDisabled ? 0.5 : 1,
          },
          typeof style === 'function' ? style(state) : style,
        ]}
        {...rest}
      >
        <LinearGradient
          colors={gradientStops(grad)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.gradientInner}>
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <AppText variant="label" style={{ color: colors.text }}>
              {title}
            </AppText>
          )}
        </View>
      </Pressable>
    );
  }

  if (variant === 'primary' || variant === 'danger') {
    const grad =
      variant === 'danger' ? dangerButtonGradient(resolved) : primaryButtonGradient(resolved);
    return (
      <Pressable
        accessibilityRole="button"
        disabled={isDisabled}
        style={(state) => [
          styles.gradientShell,
          {
            opacity: state.pressed ? 0.9 : isDisabled ? 0.5 : 1,
          },
          typeof style === 'function' ? style(state) : style,
        ]}
        {...rest}
      >
        <LinearGradient
          colors={gradientStops(grad)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.gradientInner}>
          {loading ? (
            <ActivityIndicator color={textColor} />
          ) : (
            <AppText variant="label" style={{ color: textColor }}>
              {title}
            </AppText>
          )}
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={(state) => [
        styles.base,
        variant === 'ghost' ? neonChromeOutline(resolved) : { borderWidth: 0 },
        {
          backgroundColor: 'transparent',
          opacity: state.pressed ? 0.85 : isDisabled ? 0.5 : 1,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <AppText variant="label" style={{ color: textColor }}>
          {title}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: tokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.lg,
  },
  gradientShell: {
    minHeight: 48,
    borderRadius: tokens.radius.md,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  gradientInner: {
    paddingHorizontal: tokens.spacing.lg,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
