import type { ReactElement } from 'react';
import { FlatList, StyleSheet, type RefreshControlProps, type ViewStyle } from 'react-native';

import type { Task } from '@/modules/tasks/domain/task';

export type TodayTasksListProps = {
  data: Task[];
  onDragEnd: (data: Task[]) => void;
  keyExtractor: (item: Task) => string;
  refreshControl: ReactElement<RefreshControlProps>;
  contentContainerStyle?: ViewStyle;
  ListEmptyComponent: ReactElement;
  renderRow: (item: Task, options: { drag?: () => void; isActive?: boolean }) => ReactElement;
};

export function TodayTasksList({
  data,
  keyExtractor,
  refreshControl,
  contentContainerStyle,
  ListEmptyComponent,
  renderRow,
}: TodayTasksListProps) {
  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      style={styles.list}
      refreshControl={refreshControl}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      ListEmptyComponent={ListEmptyComponent}
      renderItem={({ item }) => renderRow(item, {})}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  contentContainer: { flexGrow: 1 },
});
