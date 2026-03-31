import type { ReactElement } from 'react';
import { StyleSheet, type RefreshControlProps, type ViewStyle } from 'react-native';
import DraggableFlatList, { type RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';

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
  onDragEnd,
  keyExtractor,
  refreshControl,
  contentContainerStyle,
  ListEmptyComponent,
  renderRow,
}: TodayTasksListProps) {
  const renderItem = ({ item, drag, isActive }: RenderItemParams<Task>) => (
    <ScaleDecorator>{renderRow(item, { drag, isActive })}</ScaleDecorator>
  );

  return (
    <DraggableFlatList
      data={data}
      keyExtractor={keyExtractor}
      containerStyle={styles.list}
      style={styles.list}
      onDragEnd={({ data: next }) => onDragEnd(next)}
      refreshControl={refreshControl}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      ListEmptyComponent={ListEmptyComponent}
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  contentContainer: { flexGrow: 1 },
});
