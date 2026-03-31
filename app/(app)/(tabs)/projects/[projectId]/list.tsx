import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { filterTasks } from '@/modules/tasks/application/filterTasks';
import { useTasksFacade } from '@/modules/tasks/application/useTasksFacade';
import type { TaskPriority, TaskStatus } from '@/modules/tasks/domain/task';
import type { DueDateFilter } from '@/shared/types/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resetTaskFilters, setTaskFilters } from '@/store/uiSlice';
import { tokens } from '@/shared/theme/tokens';
import { AppButton } from '@/shared/ui/AppButton';
import { AppChip } from '@/shared/ui/AppChip';
import { AppInput } from '@/shared/ui/AppInput';
import { AppText } from '@/shared/ui/AppText';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Loader } from '@/shared/ui/Loader';
import { Screen } from '@/shared/ui/Screen';
import { TaskCard } from '@/shared/ui/TaskCard';

const statuses: (TaskStatus | 'all')[] = ['all', 'todo', 'in_progress', 'done'];
const priorities: (TaskPriority | 'all')[] = ['all', 'low', 'medium', 'high'];
const dueFilters: DueDateFilter[] = ['any', 'today', 'overdue', 'upcoming', 'no_date'];

export default function ProjectListScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.ui.taskFilters);
  const [tagInput, setTagInput] = useState(filters.tags.join(', '));
  const [showFilters, setShowFilters] = useState(false);
  const { tasks } = useTasksFacade(projectId);

  const filtered = useMemo(() => {
    const list = tasks.data ?? [];
    const tagList = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    return filterTasks(list, { ...filters, tags: tagList });
  }, [tasks.data, filters, tagInput]);

  if (tasks.isLoading) {
    return (
      <Screen>
        <Loader />
      </Screen>
    );
  }

  if (tasks.isError) {
    return (
      <Screen>
        <ErrorState message="Could not load tasks" action={<AppButton title="Retry" onPress={tasks.refetch} />} />
      </Screen>
    );
  }

  return (
    <Screen>
      <AppInput
        label="Search"
        placeholder="Title"
        value={filters.search}
        onChangeText={(search) => dispatch(setTaskFilters({ search }))}
      />
      <View style={styles.actionsRow}>
        <AppButton
          title={showFilters ? 'Hide filters' : 'Show filters'}
          variant="ghost"
          onPress={() => setShowFilters((prev) => !prev)}
          style={styles.actionsButton}
        />
        <AppButton
          title="Reset filters"
          variant="ghost"
          onPress={() => {
            setTagInput('');
            dispatch(resetTaskFilters());
          }}
          style={styles.actionsButton}
        />
      </View>
      {showFilters ? (
        <View style={styles.filtersPanel}>
          <AppText variant="label" style={styles.section}>
            Status
          </AppText>
          <View style={styles.row}>
            {statuses.map((s) => (
              <AppChip
                key={s}
                label={s === 'all' ? 'All' : s.replace('_', ' ')}
                selected={filters.status === s}
                onPress={() => dispatch(setTaskFilters({ status: s }))}
              />
            ))}
          </View>
          <AppText variant="label" style={styles.section}>
            Priority
          </AppText>
          <View style={styles.row}>
            {priorities.map((p) => (
              <AppChip
                key={p}
                label={p === 'all' ? 'All' : p}
                selected={filters.priority === p}
                onPress={() => dispatch(setTaskFilters({ priority: p }))}
              />
            ))}
          </View>
          <AppText variant="label" style={styles.section}>
            Due date
          </AppText>
          <View style={styles.row}>
            {dueFilters.map((d) => (
              <AppChip
                key={d}
                label={d.replace('_', ' ')}
                selected={filters.dueDate === d}
                onPress={() => dispatch(setTaskFilters({ dueDate: d }))}
              />
            ))}
          </View>
          <AppInput label="Tags (comma-separated)" value={tagInput} onChangeText={setTagInput} />
        </View>
      ) : null}
      <FlatList
        data={filtered}
        keyExtractor={(t) => t.id}
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={tasks.isFetching} onRefresh={tasks.refetch} />
        }
        ListEmptyComponent={
          <EmptyState title="No tasks match" message="Try adjusting filters or create a task." />
        }
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => router.push(`/(app)/(tabs)/projects/${projectId}/task/${item.id}`)}
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: tokens.spacing.sm, marginBottom: tokens.spacing.xs },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  actionsRow: { flexDirection: 'row', marginTop: tokens.spacing.sm },
  actionsButton: { flex: 1 },
  filtersPanel: { marginTop: tokens.spacing.xs },
  list: { flex: 1, marginTop: tokens.spacing.md },
});
