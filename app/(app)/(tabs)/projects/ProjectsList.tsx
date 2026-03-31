import type { ReactElement } from 'react';
import { StyleSheet, type RefreshControlProps, type ViewStyle } from 'react-native';
import DraggableFlatList, { type RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';

import type { Project } from '@/modules/projects/domain/project';

export type ProjectsListProps = {
  data: Project[];
  onDragEnd: (data: Project[]) => void;
  keyExtractor: (item: Project) => string;
  refreshControl: ReactElement<RefreshControlProps>;
  contentContainerStyle?: ViewStyle;
  ListEmptyComponent: ReactElement;
  renderCard: (item: Project, options: { drag?: () => void; isActive?: boolean }) => ReactElement;
};

export function ProjectsList({
  data,
  onDragEnd,
  keyExtractor,
  refreshControl,
  contentContainerStyle,
  ListEmptyComponent,
  renderCard,
}: ProjectsListProps) {
  const renderItem = ({ item, drag, isActive }: RenderItemParams<Project>) => (
    <ScaleDecorator>{renderCard(item, { drag, isActive })}</ScaleDecorator>
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
