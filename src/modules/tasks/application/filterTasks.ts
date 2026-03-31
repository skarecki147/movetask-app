import type { TaskFilters } from '@/shared/types/ui';

import type { Task } from '../domain/task';

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  let out = tasks;

  const q = filters.search.trim().toLowerCase();
  if (q) {
    out = out.filter((t) => t.title.toLowerCase().includes(q));
  }

  if (filters.status !== 'all') {
    out = out.filter((t) => t.status === filters.status);
  }

  if (filters.priority !== 'all') {
    out = out.filter((t) => t.priority === filters.priority);
  }

  if (filters.tags.length > 0) {
    out = out.filter((t) => filters.tags.every((tag) => t.tags.includes(tag)));
  }

  const today = startOfToday();
  if (filters.dueDate !== 'any') {
    out = out.filter((t) => {
      if (!t.dueDate) {
        return filters.dueDate === 'no_date';
      }
      const due = new Date(t.dueDate);
      if (filters.dueDate === 'today') {
        return isSameDay(due, today);
      }
      if (filters.dueDate === 'overdue') {
        return due < today && !isSameDay(due, today);
      }
      if (filters.dueDate === 'upcoming') {
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);
        return due > endOfToday;
      }
      return true;
    });
  }

  return out;
}

export function tasksDueTodayOrOverdue(tasks: Task[]): Task[] {
  const today = startOfToday();
  return tasks.filter((t) => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    return isSameDay(due, today) || due < today;
  });
}
