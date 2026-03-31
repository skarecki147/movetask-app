import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import type { Task, TaskStatus } from '@/modules/tasks/domain/task';
import { useTasksFacade } from '@/modules/tasks/application/useTasksFacade';
import { COMPACT_LAYOUT_MAX_WIDTH } from '@/shared/constants/layout';
import { tokens } from '@/shared/theme/tokens';
import { AppButton } from '@/shared/ui/AppButton';
import { AppText } from '@/shared/ui/AppText';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Loader } from '@/shared/ui/Loader';
import { Screen } from '@/shared/ui/Screen';
import { TaskCard } from '@/shared/ui/TaskCard';
import { useMovetaskTheme } from '@/shared/theme/ThemeContext';

const COLUMNS: TaskStatus[] = ['todo', 'in_progress', 'done'];

const labels: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
};

export default function ProjectBoardScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const isCompact = windowWidth <= COMPACT_LAYOUT_MAX_WIDTH;
  const { colors } = useMovetaskTheme();
  const { tasks, moveTask, moveState } = useTasksFacade(projectId);
  const [moveTarget, setMoveTarget] = useState<Task | null>(null);

  const byStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] };
    (tasks.data ?? []).forEach((t) => {
      map[t.status].push(t);
    });
    COLUMNS.forEach((c) => {
      map[c].sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
    });
    return map;
  }, [tasks.data]);

  const applyMove = useCallback(
    async (to: TaskStatus) => {
      if (!moveTarget) return;
      if (to === moveTarget.status) {
        setMoveTarget(null);
        return;
      }
      const from = moveTarget.status;
      const fromList = byStatus[from];
      const fromIndex = fromList.findIndex((t) => t.id === moveTarget.id);
      if (fromIndex < 0) return;
      const toList = byStatus[to].filter((t) => t.id !== moveTarget.id);
      try {
        await moveTask({
          taskId: moveTarget.id,
          fromColumnId: from,
          toColumnId: to,
          fromIndex,
          toIndex: toList.length,
        }).unwrap();
      } catch {
        /* noop */
      }
      setMoveTarget(null);
    },
    [byStatus, moveTarget, moveTask],
  );

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

  const total = (tasks.data ?? []).length;

  const columnNodes = COLUMNS.map((col) => (
    <View
      key={col}
      style={[
        styles.column,
        isCompact ? styles.columnCompact : styles.columnWide,
        { borderColor: colors.border, backgroundColor: colors.surface },
      ]}>
      <AppText variant="label" style={styles.colTitle}>
        {labels[col]}
      </AppText>
      <FlatList
        data={byStatus[col]}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskRow}>
            <TaskCard
              task={item}
              onPress={() => router.push(`/(app)/(tabs)/projects/${projectId}/task/${item.id}`)}
            />
            <AppButton title="Move" variant="ghost" onPress={() => setMoveTarget(item)} />
          </View>
        )}
      />
    </View>
  ));

  return (
    <Screen>
      <View style={[styles.toolbar, isCompact && styles.toolbarCompact]}>
        <AppButton
          title="Refresh"
          variant="ghost"
          onPress={() => void tasks.refetch()}
          style={isCompact ? styles.toolbarBtn : undefined}
        />
        <AppButton
          title="Add task"
          variant="secondary"
          onPress={() => router.push(`/(app)/(tabs)/projects/${projectId}/task/new`)}
          style={isCompact ? styles.toolbarBtn : undefined}
        />
      </View>
      {total === 0 ? (
        <EmptyState
          title="No tasks"
          message="Add a task to see it on the board."
          action={
            <AppButton title="Add task" onPress={() => router.push(`/(app)/(tabs)/projects/${projectId}/task/new`)} />
          }
        />
      ) : isCompact ? (
        <ScrollView
          style={styles.boardScroll}
          contentContainerStyle={styles.boardCompact}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator>
          {columnNodes}
        </ScrollView>
      ) : (
        <ScrollView
          horizontal
          style={styles.boardScroll}
          contentContainerStyle={styles.boardWide}
          showsHorizontalScrollIndicator>
          {columnNodes}
        </ScrollView>
      )}

      <Modal visible={!!moveTarget} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={StyleSheet.absoluteFill}
            onPress={() => setMoveTarget(null)}
          />
          <View
            style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onStartShouldSetResponder={() => true}>
            <AppText variant="title" style={styles.modalTitle}>
              Move task
            </AppText>
            {COLUMNS.map((c) => (
              <AppButton
                key={c}
                title={labels[c]}
                variant={moveTarget?.status === c ? 'primary' : 'secondary'}
                loading={moveState.isLoading}
                onPress={() => void applyMove(c)}
                style={styles.moveBtn}
              />
            ))}
            <AppButton title="Cancel" variant="ghost" onPress={() => setMoveTarget(null)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    marginTop: tokens.spacing.sm,
    marginBottom: tokens.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  toolbarCompact: {
    flexWrap: 'wrap',
    rowGap: tokens.spacing.sm,
  },
  toolbarBtn: {
    flexGrow: 1,
    minWidth: 120,
    maxWidth: '48%',
  },
  boardScroll: { flex: 1 },
  boardCompact: {
    paddingBottom: tokens.spacing.xxl,
    gap: tokens.spacing.lg,
  },
  boardWide: {
    flexDirection: 'row',
    paddingBottom: tokens.spacing.xl,
    gap: tokens.spacing.md,
    alignItems: 'flex-start',
  },
  column: {
    borderRadius: tokens.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: tokens.spacing.md,
  },
  columnCompact: {
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'stretch',
  },
  columnWide: {
    width: 280,
    flexShrink: 0,
    marginRight: tokens.spacing.md,
  },
  colTitle: { marginBottom: tokens.spacing.sm },
  taskRow: { marginBottom: tokens.spacing.xs },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: tokens.spacing.lg,
  },
  modalCard: {
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    zIndex: 1,
    maxWidth: '100%',
  },
  modalTitle: { marginBottom: tokens.spacing.md },
  moveBtn: { marginBottom: tokens.spacing.sm },
});
