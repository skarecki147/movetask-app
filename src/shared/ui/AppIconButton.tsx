import type { PressableProps } from 'react-native';
import { Pressable, StyleSheet } from 'react-native';

import { useMovetaskTheme } from '@/shared/theme/ThemeContext';
import { tokens } from '@/shared/theme/tokens';

type Props = PressableProps & {
  children: React.ReactNode;
  accessibilityLabel: string;
};

export function AppIconButton({ children, accessibilityLabel, style, ...rest }: Props) {
  const { colors } = useMovetaskTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={(state) => [
        styles.hit,
        { backgroundColor: state.pressed ? colors.border : 'transparent' },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    padding: tokens.spacing.sm,
    borderRadius: tokens.radius.sm,
  },
});
