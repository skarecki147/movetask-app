import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { useProjectsFacade } from '@/modules/projects/application/useProjectsFacade';
import type { Project } from '@/modules/projects/domain/project';
import { useMovetaskTheme } from '@/shared/theme/ThemeContext';
import { tokens } from '@/shared/theme/tokens';
import { useAppDispatch } from '@/store/hooks';
import { setSelectedProjectId } from '@/store/uiSlice';
import { AppButton } from '@/shared/ui/AppButton';
import { AppCard } from '@/shared/ui/AppCard';
import { AppIconButton } from '@/shared/ui/AppIconButton';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { AppInput } from '@/shared/ui/AppInput';
import { AppText } from '@/shared/ui/AppText';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Loader } from '@/shared/ui/Loader';
import { Screen } from '@/shared/ui/Screen';

import { ProjectsList } from './ProjectsList';

export default function ProjectsScreen() {
  const { colors } = useMovetaskTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { projects, createProject, createState, deleteProject, deleteState, reorderProjects } =
    useProjectsFacade();
  const [open, setOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [orderedProjects, setOrderedProjects] = useState<Project[]>([]);

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
      void 0;
    }
  };

  const list = useMemo(() => projects.data ?? [], [projects.data]);

  useEffect(() => {
    setOrderedProjects(list);
  }, [list]);

  const onDragEnd = useCallback(
    async (data: Project[]) => {
      const prev = list;
      setOrderedProjects(data);
      try {
        await reorderProjects(data.map((p) => p.id)).unwrap();
      } catch {
        setOrderedProjects(prev);
      }
    },
    [list, reorderProjects],
  );

  const requestDeleteProject = useCallback((project: Project) => {
    setProjectToDelete(project);
  }, []);

  const handleCancelDelete = useCallback(() => setProjectToDelete(null), []);

  const handleConfirmDelete = useCallback(async () => {
    if (!projectToDelete) return;
    try {
      await deleteProject(projectToDelete.id).unwrap();
      setProjectToDelete(null);
    } catch {
      void 0;
    }
  }, [deleteProject, projectToDelete]);

  const renderProjectCard = useCallback(
    (
      item: Project,
      options: { drag?: () => void; isActive?: boolean } = {},
    ) => (
      <AppCard style={[styles.card, options.isActive ? styles.cardActive : null]}>
        <View style={styles.cardRow}>
          {Platform.OS !== 'web' && options.drag ? (
            <Pressable
              onLongPress={options.drag}
              delayLongPress={180}
              style={styles.dragHandle}
              accessibilityRole="button"
              accessibilityLabel={`Reorder project ${item.name}`}>
              <FontAwesome name="bars" size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
          <View style={styles.cardMain}>
            <View style={styles.titleRow}>
              <Pressable
                style={styles.titlePressable}
                accessibilityRole="button"
                accessibilityLabel={`Open project ${item.name}`}
                onPress={() => openProject(item.id)}>
                <AppText variant="title">{item.name}</AppText>
              </Pressable>
              <AppIconButton
                accessibilityLabel={`Delete project ${item.name}`}
                onPress={() => requestDeleteProject(item)}>
                <FontAwesome name="trash-o" size={20} color={colors.danger} />
              </AppIconButton>
            </View>
            {item.description ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Open project ${item.name}`}
                onPress={() => openProject(item.id)}>
                <AppText variant="body" muted numberOfLines={2} style={styles.desc}>
                  {item.description}
                </AppText>
              </Pressable>
            ) : null}
          </View>
        </View>
      </AppCard>
    ),
    [colors.danger, colors.textMuted, openProject, requestDeleteProject],
  );

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

  const listEmpty = (
    <EmptyState
      title="No projects yet"
      message="Create a project to start organizing tasks."
      action={<AppButton title="Create project" onPress={() => setOpen(true)} />}
    />
  );

  const refreshControl = (
    <RefreshControl refreshing={projects.isFetching} onRefresh={projects.refetch} />
  );

  return (
    <Screen>
      <View style={styles.body}>
        <View style={styles.header}>
          <AppButton title="New project" variant="secondary" onPress={() => setOpen(true)} />
        </View>
        <ProjectsList
          data={orderedProjects}
          keyExtractor={(item) => item.id}
          onDragEnd={onDragEnd}
          refreshControl={refreshControl}
          contentContainerStyle={orderedProjects.length === 0 ? styles.emptyList : undefined}
          ListEmptyComponent={listEmpty}
          renderCard={renderProjectCard}
        />
      </View>

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

      <ConfirmDialog
        visible={projectToDelete != null}
        title="Delete project?"
        message={
          projectToDelete
            ? `“${projectToDelete.name}” and all tasks in it will be removed. This cannot be undone.`
            : ''
        }
        onCancel={handleCancelDelete}
        onConfirm={() => void handleConfirmDelete()}
        confirmLoading={deleteState.isLoading}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, minHeight: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: tokens.spacing.md,
    marginTop: tokens.spacing.xs,
  },
  card: { marginBottom: tokens.spacing.sm },
  cardActive: { opacity: 0.92 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: tokens.spacing.sm },
  dragHandle: {
    paddingVertical: tokens.spacing.xs,
    paddingRight: tokens.spacing.xs,
    marginTop: 2,
  },
  cardMain: { flex: 1, minWidth: 0 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.spacing.xs,
  },
  titlePressable: { flex: 1, minWidth: 0 },
  desc: { marginTop: tokens.spacing.xs },
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
