import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { useProjectsFacade } from '@/modules/projects/application/useProjectsFacade';
import { useMovetaskTheme } from '@/shared/theme/ThemeContext';
import { tokens } from '@/shared/theme/tokens';
import { useAppDispatch } from '@/store/hooks';
import { setSelectedProjectId } from '@/store/uiSlice';
import { AppButton } from '@/shared/ui/AppButton';
import { AppCard } from '@/shared/ui/AppCard';
import { AppInput } from '@/shared/ui/AppInput';
import { AppText } from '@/shared/ui/AppText';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Loader } from '@/shared/ui/Loader';
import { Screen } from '@/shared/ui/Screen';

export default function ProjectsScreen() {
  const { colors } = useMovetaskTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { projects, createProject, createState, deleteProject } = useProjectsFacade();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const openProject = useCallback(
    (id: string) => {
      dispatch(setSelectedProjectId(id));
      router.push(`/(app)/(tabs)/projects/${id}`);
    },
    [dispatch, router],
  );

  const onCreate = async () => {
    if (!name.trim()) return;
    try {
      await createProject({ name: name.trim(), description: description.trim() || undefined }).unwrap();
      setName('');
      setDescription('');
      setOpen(false);
    } catch {
      /* toast optional */
    }
  };

  if (projects.isLoading) {
    return (
      <Screen>
        <Loader />
      </Screen>
    );
  }

  if (projects.isError) {
    return (
      <Screen>
        <ErrorState message="Could not load projects" action={<AppButton title="Retry" onPress={projects.refetch} />} />
      </Screen>
    );
  }

  const list = projects.data ?? [];

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="heading">Projects</AppText>
        <AppButton title="New project" variant="secondary" onPress={() => setOpen(true)} />
      </View>
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={projects.isFetching} onRefresh={projects.refetch} />}
        contentContainerStyle={list.length === 0 ? styles.emptyList : undefined}
        ListEmptyComponent={
          <EmptyState
            title="No projects yet"
            message="Create a project to start organizing tasks."
            action={<AppButton title="Create project" onPress={() => setOpen(true)} />}
          />
        }
        renderItem={({ item }) => (
          <AppCard style={styles.card}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open project ${item.name}`}
              onPress={() => openProject(item.id)}>
              <AppText variant="title">{item.name}</AppText>
              {item.description ? (
                <AppText variant="body" muted numberOfLines={2} style={styles.desc}>
                  {item.description}
                </AppText>
              ) : null}
            </Pressable>
            <View style={styles.row}>
              <AppButton
                title="Delete"
                variant="ghost"
                onPress={() => void deleteProject(item.id)}
              />
            </View>
          </AppCard>
        )}
      />

      <Modal visible={open} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
            style={StyleSheet.absoluteFill}
            onPress={() => setOpen(false)}
          />
          <View
            style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onStartShouldSetResponder={() => true}>
            <AppText variant="title" style={styles.modalTitle}>
              New project
            </AppText>
            <AppInput label="Name" value={name} onChangeText={setName} />
            <AppInput label="Description" value={description} onChangeText={setDescription} multiline />
            <View style={styles.modalActions}>
              <AppButton title="Cancel" variant="ghost" onPress={() => setOpen(false)} />
              <AppButton title="Create" onPress={onCreate} loading={createState.isLoading} />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.md,
    marginTop: tokens.spacing.sm,
  },
  card: { marginBottom: tokens.spacing.sm },
  desc: { marginTop: tokens.spacing.xs },
  row: { marginTop: tokens.spacing.sm },
  emptyList: { flexGrow: 1 },
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
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: tokens.spacing.sm, marginTop: tokens.spacing.md },
});
