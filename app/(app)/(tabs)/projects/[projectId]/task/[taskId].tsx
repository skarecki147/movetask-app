import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { useTasksFacade } from '@/modules/tasks/application/useTasksFacade';
import type { TaskPriority, TaskStatus } from '@/modules/tasks/domain/task';
import { tokens } from '@/shared/theme/tokens';
import { AppButton } from '@/shared/ui/AppButton';
import { AppChip } from '@/shared/ui/AppChip';
import { AppInput } from '@/shared/ui/AppInput';
import { AppText } from '@/shared/ui/AppText';
import { Loader } from '@/shared/ui/Loader';
import { Screen } from '@/shared/ui/Screen';

const statuses: TaskStatus[] = ['todo', 'in_progress', 'done'];
const priorities: TaskPriority[] = ['low', 'medium', 'high'];

export default function TaskDetailScreen() {
  const { projectId, taskId } = useLocalSearchParams<{ projectId: string; taskId: string }>();
  const router = useRouter();
  const { tasks, updateTask, updateState, deleteTask, deleteState } = useTasksFacade(projectId);

  const task = useMemo(() => tasks.data?.find((t) => t.id === taskId), [tasks.data, taskId]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [tags, setTags] = useState('');

  const dueDateValue = dueDate ? new Date(`${dueDate}T00:00:00`) : new Date();

  const onDueDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') {
      setShowDueDatePicker(false);
    }
    if (!selectedDate) return;
    setDueDate(selectedDate.toISOString().slice(0, 10));
  };

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description ?? '');
    setStatus(task.status);
    setPriority(task.priority);
    setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '');
    setTags(task.tags.join(', '));
  }, [task]);

  const onSave = async () => {
    if (!task || !title.trim()) return;
    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      await updateTask({
        taskId: task.id,
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        dueDate: dueDate.trim() || null,
        tags: tagList,
      }).unwrap();
      router.back();
    } catch {
      void 0;
    }
  };

  const onDelete = async () => {
    if (!task) return;
    try {
      await deleteTask({ taskId: task.id, projectId }).unwrap();
      router.replace(`/(app)/(tabs)/projects/${projectId}`);
    } catch {
      void 0;
    }
  };

  if (tasks.isLoading) {
    return (
      <Screen>
        <Loader />
      </Screen>
    );
  }

  if (!task) {
    return (
      <Screen scroll>
        <AppText variant="body">Task not found.</AppText>
        <AppButton title="Back" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <AppInput label="Title" value={title} onChangeText={setTitle} />
      <AppInput label="Description" value={description} onChangeText={setDescription} multiline />
      <AppText variant="label" style={styles.section}>
        Status
      </AppText>
      <View style={styles.row}>
        {statuses.map((s) => (
          <AppChip
            key={s}
            label={s.replace('_', ' ')}
            selected={status === s}
            onPress={() => setStatus(s)}
          />
        ))}
      </View>
      <AppText variant="label" style={styles.section}>
        Priority
      </AppText>
      <View style={styles.row}>
        {priorities.map((p) => (
          <AppChip key={p} label={p} selected={priority === p} onPress={() => setPriority(p)} />
        ))}
      </View>
      {Platform.OS === 'web' ? (
        <AppInput
          label="Due date"
          placeholder="YYYY-MM-DD"
          value={dueDate}
          onChangeText={setDueDate}
        />
      ) : (
        <Pressable onPress={() => setShowDueDatePicker(true)}>
          <View pointerEvents="none">
            <AppInput label="Due date" placeholder="YYYY-MM-DD" value={dueDate} editable={false} />
          </View>
        </Pressable>
      )}
      {showDueDatePicker && Platform.OS !== 'web' ? (
        <DateTimePicker
          mode="date"
          value={dueDateValue}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDueDateChange}
        />
      ) : null}
      <AppInput label="Tags (comma-separated)" value={tags} onChangeText={setTags} />
      <View style={styles.actions}>
        <AppButton title="Save" onPress={onSave} loading={updateState.isLoading} />
        <AppButton
          title="Delete task"
          variant="danger"
          onPress={onDelete}
          loading={deleteState.isLoading}
          style={styles.secondaryAction}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: tokens.spacing.sm, marginBottom: tokens.spacing.xs },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  actions: { marginTop: tokens.spacing.sm },
  secondaryAction: { marginTop: tokens.spacing.sm },
});
