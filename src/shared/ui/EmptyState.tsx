import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { tokens } from '@/shared/theme/tokens';

import { AppText } from './AppText';

type Props = {
  title: string;
  message?: string;
  action?: ReactNode;
};

export function EmptyState({ title, message, action }: Props) {
  return (
    <View style={styles.wrap}>
      <AppText variant="title" style={styles.title}>
        {title}
      </AppText>
      {message ? (
        <AppText variant="body" muted style={styles.message}>
          {message}
        </AppText>
      ) : null}
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
  title: { textAlign: 'center', marginBottom: tokens.spacing.sm },
  message: { textAlign: 'center' },
  action: { marginTop: tokens.spacing.lg },
});
