import { filterTasks } from '../filterTasks';
import type { Task } from '../../domain/task';
import type { TaskFilters } from '@/shared/types/ui';

const baseTask = (over: Partial<Task>): Task => ({
  id: 't1',
  projectId: 'p1',
  title: 'Alpha',
  description: '',
  status: 'todo',
  priority: 'medium',
  tags: [],
  sortOrder: 0,
  ...over,
});

describe('filterTasks', () => {
  const defaultFilters: TaskFilters = {
    search: '',
    status: 'all',
    priority: 'all',
    dueDate: 'any',
    tags: [],
  };

  it('filters by title search', () => {
    const tasks = [baseTask({ id: '1', title: 'Hello' }), baseTask({ id: '2', title: 'World' })];
    const out = filterTasks(tasks, { ...defaultFilters, search: 'hel' });
    expect(out.map((t) => t.id)).toEqual(['1']);
  });

  it('filters by status', () => {
    const tasks = [baseTask({ id: '1', status: 'done' }), baseTask({ id: '2', status: 'todo' })];
    const out = filterTasks(tasks, { ...defaultFilters, status: 'todo' });
    expect(out.map((t) => t.id)).toEqual(['2']);
  });
});
