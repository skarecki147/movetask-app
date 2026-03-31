import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useMovetaskTheme } from '@/shared/theme/ThemeContext';
import { tokens } from '@/shared/theme/tokens';

import { AppText } from './AppText';

type Props = {
  title?: string;
  message: string;
  action?: ReactNode;
};

export function ErrorState({ title = 'Something went wrong', message, action }: Props) {
  const { colors } = useMovetaskTheme();
  return (
    <View style={styles.wrap}>
      <AppText variant="title" style={{ color: colors.danger, textAlign: 'center' }}>
        {title}
      </AppText>
      <AppText variant="body" muted style={styles.message}>
        {message}
      </AppText>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing.xl,
  },
  message: { textAlign: 'center', marginTop: tokens.spacing.sm },
  action: { marginTop: tokens.spacing.lg },
});
