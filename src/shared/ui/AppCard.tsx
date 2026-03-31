import type { ViewProps } from 'react-native';
import { View, StyleSheet, Pressable } from 'react-native';

import { useMovetaskTheme } from '@/shared/theme/ThemeContext';
import { tokens } from '@/shared/theme/tokens';

type Props = ViewProps & {
  onPress?: () => void;
};

export function AppCard({ children, style, onPress, ...rest }: Props) {
  const { colors } = useMovetaskTheme();
  const base = [
    styles.card,
    { backgroundColor: colors.surface, borderColor: colors.border },
  ];
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [...base, style, pressed && { opacity: 0.92 }]}>
        {children}
      </Pressable>
    );
  }
  return (
    <View style={[...base, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: tokens.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: tokens.spacing.md,
  },
});
