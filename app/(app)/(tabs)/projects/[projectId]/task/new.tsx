import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { useTasksFacade } from '@/modules/tasks/application/useTasksFacade';
import type { TaskPriority, TaskStatus } from '@/modules/tasks/domain/task';
import { tokens } from '@/shared/theme/tokens';
import { AppButton } from '@/shared/ui/AppButton';
import { AppChip } from '@/shared/ui/AppChip';
import { AppInput } from '@/shared/ui/AppInput';
import { AppText } from '@/shared/ui/AppText';
import { Screen } from '@/shared/ui/Screen';

const statuses: TaskStatus[] = ['todo', 'in_progress', 'done'];
const priorities: TaskPriority[] = ['low', 'medium', 'high'];

export default function NewTaskScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const { createTask, createState } = useTasksFacade(projectId);
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

  const onSave = async () => {
    if (!title.trim()) return;
    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      await createTask({
        projectId,
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        dueDate: dueDate.trim() || undefined,
        tags: tagList,
      }).unwrap();
      router.back();
    } catch {
      /* noop */
    }
  };

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
      <AppButton title="Create task" onPress={onSave} loading={createState.isLoading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: tokens.spacing.sm, marginBottom: tokens.spacing.xs },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
});
