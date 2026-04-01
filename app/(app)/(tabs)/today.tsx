import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useContentPaddingBelowTransparentHeader } from '@/shared/lib/useContentPaddingBelowTransparentHeader';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { filterTasks, tasksDueTodayOrOverdue } from '@/modules/tasks/application/filterTasks';
import { sortOrderUpdatesForTodayReorder } from '@/modules/tasks/application/sortOrderUpdatesForTodayReorder';
import { useAllTasksFacade } from '@/modules/tasks/application/useTasksFacade';
import type { Task } from '@/modules/tasks/domain/task';
import { useProjectsFacade } from '@/modules/projects/application/useProjectsFacade';
import { useMovetaskTheme } from '@/shared/theme/ThemeContext';
import { tokens } from '@/shared/theme/tokens';
import { useAppSelector } from '@/store/hooks';
import { useUpdateTaskMutation } from '@/store/movetaskApi';
import { AppButton } from '@/shared/ui/AppButton';
import { AppText } from '@/shared/ui/AppText';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Loader } from '@/shared/ui/Loader';
import { Screen } from '@/shared/ui/Screen';
import { TaskCard } from '@/shared/ui/TaskCard';

import { TodayTasksList } from './TodayTasksList';

export default function TodayScreen() {
  const router = useRouter();
  const headerContentPadding = useContentPaddingBelowTransparentHeader();
  const { colors } = useMovetaskTheme();
  const filters = useAppSelector((s) => s.ui.taskFilters);
  const tasksQuery = useAllTasksFacade();
  const [updateTask] = useUpdateTaskMutation();
  const { projects } = useProjectsFacade();
  const [orderedItems, setOrderedItems] = useState<Task[]>([]);

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

  useEffect(() => {
    setOrderedItems(items);
  }, [items]);

  const onDragEnd = useCallback(
    async (data: Task[]) => {
      const snapshot = items;
      setOrderedItems(data);
      const all = tasksQuery.data ?? [];
      try {
        const updates = sortOrderUpdatesForTodayReorder(data, all);
        if (updates.length > 0) {
          await Promise.all(updates.map((u) => updateTask(u).unwrap()));
        }
      } catch {
        setOrderedItems(snapshot);
      }
    },
    [items, tasksQuery.data, updateTask],
  );

  const renderRow = useCallback(
    (task: Task, options: { drag?: () => void; isActive?: boolean }) => (
      <View style={[styles.rowWrap, options.isActive ? styles.rowActive : null]}>
        <AppText variant="caption" muted style={styles.projectLabel}>
          {projectNameById.get(task.projectId) ?? 'Project'}
        </AppText>
        <TaskCard
          task={task}
          onPress={() => router.push(`/(app)/(tabs)/projects/${task.projectId}/task/${task.id}`)}
          trailing={
            Platform.OS !== 'web' && options.drag ? (
              <Pressable
                onLongPress={options.drag}
                delayLongPress={180}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={`Reorder task ${task.title}`}
              >
                <FontAwesome name="bars" size={18} color={colors.textMuted} />
              </Pressable>
            ) : undefined
          }
        />
      </View>
    ),
    [colors.textMuted, projectNameById, router],
  );

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

  const listEmpty = <EmptyState title="All clear" message="No tasks due today or overdue." />;

  const refreshControl = (
    <RefreshControl refreshing={tasksQuery.isFetching} onRefresh={tasksQuery.refetch} />
  );

  return (
    <Screen>
      <View style={[styles.body, { paddingTop: headerContentPadding }]}>
        <AppText variant="body" muted style={styles.sub}>
          Tasks due today or overdue
        </AppText>
        <TodayTasksList
          data={orderedItems}
          keyExtractor={(t) => t.id}
          onDragEnd={onDragEnd}
          refreshControl={refreshControl}
          contentContainerStyle={orderedItems.length === 0 ? styles.empty : undefined}
          ListEmptyComponent={listEmpty}
          renderRow={renderRow}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, minHeight: 0 },
  sub: { marginTop: tokens.spacing.xs, marginBottom: tokens.spacing.md },
  empty: { flexGrow: 1 },
  rowWrap: { marginBottom: tokens.spacing.xs },
  rowActive: { opacity: 0.92 },
  projectLabel: { marginBottom: tokens.spacing.xs },
});
