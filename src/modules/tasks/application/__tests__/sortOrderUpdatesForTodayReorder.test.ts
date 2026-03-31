import type { Task } from '@/modules/tasks/domain/task';
import { sortOrderUpdatesForTodayReorder } from '../sortOrderUpdatesForTodayReorder';

const task = (id: string, projectId: string, sortOrder: number, title: string): Task => ({
  id,
  projectId,
  title,
  status: 'todo',
  priority: 'medium',
  tags: [],
  sortOrder,
});

describe('sortOrderUpdatesForTodayReorder', () => {
  it('reorders visible tasks at front of each project and preserves hidden tasks after', () => {
    const all = [
      task('a', 'p1', 0, 'A'),
      task('b', 'p1', 1, 'B'),
      task('c', 'p2', 0, 'C'),
    ];
    const visible = [task('b', 'p1', 1, 'B'), task('a', 'p1', 0, 'A'), task('c', 'p2', 0, 'C')];
    const updates = sortOrderUpdatesForTodayReorder(visible, all);
    const byId = Object.fromEntries(updates.map((u) => [u.taskId, u.sortOrder]));
    expect(byId).toEqual({ b: 0, a: 1 });
  });
});
