import { StyleSheet, View } from 'react-native';

import { useMovetaskTheme } from '@/shared/theme/ThemeContext';
import { tokens } from '@/shared/theme/tokens';

export function Divider() {
  const { colors } = useMovetaskTheme();
  return <View style={[styles.line, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  line: { height: StyleSheet.hairlineWidth, marginVertical: tokens.spacing.md },
});
