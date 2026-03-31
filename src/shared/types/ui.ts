import type { TaskPriority, TaskStatus } from '@/modules/tasks/domain/task';

export type ThemePreference = 'light' | 'dark' | 'system';

export type DueDateFilter = 'any' | 'today' | 'overdue' | 'upcoming' | 'no_date';

export type TaskFilters = {
  search: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  dueDate: DueDateFilter;
  tags: string[];
};
