import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useHeaderHeight } from '@react-navigation/elements';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { useTasksFacade } from '@/modules/tasks/application/useTasksFacade';
import type { Task, TaskStatus } from '@/modules/tasks/domain/task';
import {
  cardSurfaceGradient,
  gradientStops,
  primaryButtonGradient,
} from '@/shared/theme/gradients';
import { neonContainerStyle } from '@/shared/theme/neon';
import { useMovetaskTheme } from '@/shared/theme/ThemeContext';
import { tokens } from '@/shared/theme/tokens';
import { AppButton } from '@/shared/ui/AppButton';
import { AppText } from '@/shared/ui/AppText';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Loader } from '@/shared/ui/Loader';
import { Screen } from '@/shared/ui/Screen';
import { TaskCard } from '@/shared/ui/TaskCard';

const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done'];

const tabLabels: Record<TaskStatus, string> = {
  todo: 'TODO',
  in_progress: 'In-Progress',
  done: 'Done',
};

const columnLabels: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
};

const screenUnderHeader = (headerHeight: number) => ({
  flex: 1,
  minHeight: 0,
  paddingTop: headerHeight,
});

const FAB_SIZE = 56;
const FAB_OVERLAP_INTO_TAB_BAR = 40;
const FAB_RIGHT_INSET = tokens.spacing.xxl;

export default function ProjectBoardScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const router = useRouter();
  const { colors, resolved } = useMovetaskTheme();
  const { tasks, moveTask, moveState } = useTasksFacade(projectId);
  const [selectedTab, setSelectedTab] = useState<TaskStatus>('todo');
  const [moveTarget, setMoveTarget] = useState<Task | null>(null);

  const byStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] };
    (tasks.data ?? []).forEach((t) => {
      map[t.status].push(t);
    });
    STATUSES.forEach((c) => {
      map[c].sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
    });
    return map;
  }, [tasks.data]);

  const listForTab = byStatus[selectedTab];

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
        setSelectedTab(to);
      } catch {
        void 0;
      }
      setMoveTarget(null);
    },
    [byStatus, moveTarget, moveTask],
  );

  const newTaskRoute = {
    pathname: '/(app)/(tabs)/projects/[projectId]/task/new' as const,
    params: { projectId },
  };
  const fabBottom = Math.max(tokens.spacing.sm, tabBarHeight - FAB_OVERLAP_INTO_TAB_BAR);
  const listBottomPad = fabBottom + FAB_SIZE + tokens.spacing.md;

  const newTaskFab = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="New task"
      onPress={() => router.push(newTaskRoute)}
      style={({ pressed }) => [
        styles.fab,
        {
          bottom: fabBottom,
          right: FAB_RIGHT_INSET,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <LinearGradient
        colors={gradientStops(primaryButtonGradient(resolved))}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <FontAwesome name="plus" size={26} color={colors.primaryText} />
    </Pressable>
  );

  if (tasks.isLoading) {
    return (
      <Screen contentStyle={screenUnderHeader(headerHeight)}>
        <Loader />
        {newTaskFab}
      </Screen>
    );
  }

  if (tasks.isError) {
    return (
      <Screen contentStyle={screenUnderHeader(headerHeight)}>
        <ErrorState
          message="Could not load tasks"
          action={<AppButton title="Retry" onPress={tasks.refetch} />}
        />
        {newTaskFab}
      </Screen>
    );
  }

  const total = (tasks.data ?? []).length;

  const refreshControl = (
    <RefreshControl refreshing={tasks.isFetching} onRefresh={() => void tasks.refetch()} />
  );

  return (
    <Screen contentStyle={screenUnderHeader(headerHeight)}>
      <View style={styles.tabRow}>
        {STATUSES.map((status) => {
          const selected = selectedTab === status;
          return (
            <Pressable
              key={status}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={`${tabLabels[status]} tasks`}
              onPress={() => setSelectedTab(status)}
              style={({ pressed }) => [
                styles.tab,
                {
                  backgroundColor: selected ? colors.primary : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                  opacity: pressed ? 0.92 : 1,
                },
              ]}
            >
              <AppText
                variant="caption"
                numberOfLines={1}
                style={{ color: selected ? colors.primaryText : colors.text, fontWeight: '600' }}
              >
                {tabLabels[status]}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {total === 0 ? (
        <View style={{ flex: 1, paddingBottom: listBottomPad }}>
          <EmptyState
            title="No tasks"
            message="Add a task to see it here."
            action={<AppButton title="Add task" onPress={() => router.push(newTaskRoute)} />}
          />
        </View>
      ) : (
        <FlatList
          data={listForTab}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={
            listForTab.length === 0
              ? styles.listEmpty
              : [styles.listContent, { paddingBottom: listBottomPad }]
          }
          refreshControl={refreshControl}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <EmptyState
              title={`No ${columnLabels[selectedTab]} tasks`}
              message="Switch tabs or create a task."
              action={
                <AppButton
                  title="Add task"
                  variant="secondary"
                  onPress={() => router.push(newTaskRoute)}
                />
              }
            />
          }
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPress={() => router.push(`/(app)/(tabs)/projects/${projectId}/task/${item.id}`)}
              trailing={
                <AppButton
                  title="Move"
                  variant="ghost"
                  onPress={() => setMoveTarget(item)}
                  style={styles.moveInCard}
                />
              }
            />
          )}
        />
      )}

      {newTaskFab}

      <Modal visible={!!moveTarget} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={StyleSheet.absoluteFill}
            onPress={() => setMoveTarget(null)}
          />
          <View
            style={[styles.modalCardWrap, neonContainerStyle(resolved, tokens.radius.lg)]}
            onStartShouldSetResponder={() => true}
          >
            <LinearGradient
              colors={gradientStops(cardSurfaceGradient(resolved, colors))}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.modalCard, { borderColor: 'transparent' }]}
            >
              <AppText variant="title" style={styles.modalTitle}>
                Move task
              </AppText>
              {STATUSES.map((c) => (
                <AppButton
                  key={c}
                  title={columnLabels[c]}
                  variant={moveTarget?.status === c ? 'primary' : 'secondary'}
                  loading={moveState.isLoading}
                  onPress={() => void applyMove(c)}
                  style={styles.moveBtn}
                />
              ))}
              <AppButton title="Cancel" variant="ghost" onPress={() => setMoveTarget(null)} />
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    marginTop: tokens.spacing.sm,
    marginBottom: tokens.spacing.md,
    gap: tokens.spacing.xs,
  },
  tab: {
    flex: 1,
    minWidth: 0,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.xs,
    borderRadius: tokens.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { flex: 1 },
  listContent: { paddingBottom: tokens.spacing.xxl },
  listEmpty: { flexGrow: 1 },
  moveInCard: {
    minHeight: 40,
    paddingHorizontal: tokens.spacing.sm,
    alignSelf: 'flex-start',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: tokens.spacing.lg,
  },
  modalCardWrap: {
    zIndex: 1,
    maxWidth: '100%',
    borderRadius: tokens.radius.lg,
  },
  modalCard: {
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    borderWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
  },
  modalTitle: { marginBottom: tokens.spacing.md },
  moveBtn: { marginBottom: tokens.spacing.sm },
  fab: {
    position: 'absolute',
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
  },
});
