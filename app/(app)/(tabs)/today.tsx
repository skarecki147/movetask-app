import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { filterTasks, tasksDueTodayOrOverdue } from '@/modules/tasks/application/filterTasks';
import { useAllTasksFacade } from '@/modules/tasks/application/useTasksFacade';
import { useProjectsFacade } from '@/modules/projects/application/useProjectsFacade';
import { useAppSelector } from '@/store/hooks';
import { tokens } from '@/shared/theme/tokens';
import { AppButton } from '@/shared/ui/AppButton';
import { AppText } from '@/shared/ui/AppText';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Loader } from '@/shared/ui/Loader';
import { Screen } from '@/shared/ui/Screen';
import { TaskCard } from '@/shared/ui/TaskCard';

export default function TodayScreen() {
  const router = useRouter();
  const filters = useAppSelector((s) => s.ui.taskFilters);
  const tasksQuery = useAllTasksFacade();
  const { projects } = useProjectsFacade();

  const projectNameById = useMemo(() => {
    const map = new Map<string, string>();
    (projects.data ?? []).forEach((p) => map.set(p.id, p.name));
    return map;
  }, [projects.data]);

  const items = useMemo(() => {
    const all = tasksQuery.data ?? [];
    const narrowed = tasksDueTodayOrOverdue(all);
    return filterTasks(narrowed, filters);
  }, [tasksQuery.data, filters]);

  if (tasksQuery.isLoading || projects.isLoading) {
    return (
      <Screen>
        <Loader />
      </Screen>
    );
  }

  if (tasksQuery.isError) {
    return (
      <Screen>
        <ErrorState
          message="Could not load tasks"
          action={<AppButton title="Retry" onPress={tasksQuery.refetch} />}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <AppText variant="heading" style={styles.title}>
        Today
      </AppText>
      <AppText variant="body" muted style={styles.sub}>
        Tasks due today or overdue
      </AppText>
      <FlatList
        data={items}
        keyExtractor={(t) => t.id}
        refreshControl={
          <RefreshControl refreshing={tasksQuery.isFetching} onRefresh={tasksQuery.refetch} />
        }
        contentContainerStyle={items.length === 0 ? styles.empty : undefined}
        ListEmptyComponent={
          <EmptyState title="All clear" message="No tasks due today or overdue." />
        }
        renderItem={({ item }) => (
          <View>
            <AppText variant="caption" muted style={styles.projectLabel}>
              {projectNameById.get(item.projectId) ?? 'Project'}
            </AppText>
            <TaskCard
              task={item}
              onPress={() => router.push(`/(app)/(tabs)/projects/${item.projectId}/task/${item.id}`)}
            />
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: tokens.spacing.sm, marginBottom: tokens.spacing.xs },
  sub: { marginBottom: tokens.spacing.md },
  empty: { flexGrow: 1 },
  projectLabel: { marginBottom: tokens.spacing.xs },
});
