import { StyleSheet, View } from 'react-native';

import type { Task } from '@/modules/tasks/domain/task';

import { tokens } from '@/shared/theme/tokens';

import { useMovetaskTheme } from '@/shared/theme/ThemeContext';

import { AppCard } from './AppCard';
import { AppText } from './AppText';

type Props = {
  task: Task;
  onPress?: () => void;
};

const priorityLabel: Record<Task['priority'], string> = {
  low: 'Low',
  medium: 'Med',
  high: 'High',
};

function Badge({ label }: { label: string }) {
  const { colors } = useMovetaskTheme();
  return (
    <View style={[styles.badge, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <AppText variant="caption">{label}</AppText>
    </View>
  );
}

export function TaskCard({ task, onPress }: Props) {
  return (
    <AppCard onPress={onPress} style={styles.card}>
      <AppText variant="label" numberOfLines={2}>
        {task.title}
      </AppText>
      {task.description ? (
        <AppText variant="caption" muted numberOfLines={2} style={styles.desc}>
          {task.description}
        </AppText>
      ) : null}
      <View style={styles.row}>
        <Badge label={task.status.replace('_', ' ')} />
        <Badge label={priorityLabel[task.priority]} />
      </View>
      {task.dueDate ? (
        <AppText variant="caption" muted style={styles.due}>
          Due {new Date(task.dueDate).toLocaleDateString()}
        </AppText>
      ) : null}
      {task.tags.length > 0 ? (
        <View style={[styles.row, styles.tags]}>
          {task.tags.map((t) => (
            <AppText key={t} variant="caption" muted>
              #{t}{' '}
            </AppText>
          ))}
        </View>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: tokens.spacing.sm },
  desc: { marginTop: tokens.spacing.xs },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginTop: tokens.spacing.sm, gap: tokens.spacing.xs },
  badge: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 2,
    borderRadius: tokens.radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tags: { marginTop: tokens.spacing.xs },
  due: { marginTop: tokens.spacing.xs },
});
