import type { ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { View, StyleSheet, Pressable } from 'react-native';

import { cardSurfaceGradient, gradientStops } from '@/shared/theme/gradients';
import { neonInnerBorderColor, neonShellStyle } from '@/shared/theme/neon';
import { useMovetaskTheme } from '@/shared/theme/ThemeContext';
import { tokens } from '@/shared/theme/tokens';

type Props = ViewProps & {
  onPress?: () => void;
};

export function AppCard({ children, style, onPress, ...rest }: Props) {
  const { colors, resolved } = useMovetaskTheme();
  const neon = neonShellStyle(resolved);
  const grad = cardSurfaceGradient(resolved, colors);

  const inner = (
    <LinearGradient
      colors={gradientStops(grad)}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { borderColor: neonInnerBorderColor(resolved) }]}
    >
      {children}
    </LinearGradient>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.shadowWrap,
          neon,
          style,
          pressed && { opacity: 0.96, transform: [{ scale: 0.992 }] },
        ]}
      >
        {inner}
      </Pressable>
    );
  }
  return (
    <View style={[styles.shadowWrap, neon, style]} {...rest}>
      {inner}
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: tokens.radius.md,
    backgroundColor: 'transparent',
  },
  card: {
    borderRadius: tokens.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: tokens.spacing.md,
    overflow: 'hidden',
  },
});
