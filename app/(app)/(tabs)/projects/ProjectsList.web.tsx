import type { ReactElement } from 'react';
import { FlatList, StyleSheet, type RefreshControlProps, type ViewStyle } from 'react-native';

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
  keyExtractor,
  refreshControl,
  contentContainerStyle,
  ListEmptyComponent,
  renderCard,
}: ProjectsListProps) {
  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      style={styles.list}
      refreshControl={refreshControl}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      ListEmptyComponent={ListEmptyComponent}
      renderItem={({ item }) => renderCard(item, {})}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  contentContainer: { flexGrow: 1 },
});
