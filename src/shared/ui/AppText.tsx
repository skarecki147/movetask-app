import type { TextProps } from 'react-native';
import { Text, StyleSheet } from 'react-native';

import { useMovetaskTheme } from '@/shared/theme/ThemeContext';
import { tokens } from '@/shared/theme/tokens';

type Variant = 'caption' | 'label' | 'body' | 'title' | 'heading';

type Props = TextProps & {
  variant?: Variant;
  muted?: boolean;
};

export function AppText({ variant = 'body', muted, style, ...rest }: Props) {
  const { colors } = useMovetaskTheme();
  const color = muted ? colors.textMuted : colors.text;
  return <Text style={[styles[variant], { color }, style]} {...rest} />;
}

const styles = StyleSheet.create({
  caption: { fontSize: tokens.typography.caption },
  label: { fontSize: tokens.typography.label, fontWeight: '600' },
  body: { fontSize: tokens.typography.body },
  title: { fontSize: tokens.typography.title, fontWeight: '700' },
  heading: { fontSize: tokens.typography.heading, fontWeight: '800' },
});
