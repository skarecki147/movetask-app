import type { StoredTask } from '@/shared/lib/appStorage';

import type { Task } from '../domain/task';

export function storedTaskToDomain(row: StoredTask): Task {
  return {
    id: row.id,
    projectId: row.projectId,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    dueDate: row.dueDate,
    tags: row.tags ?? [],
    sortOrder: row.sortOrder,
  };
}

export function domainTaskToStored(task: Task): StoredTask {
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    tags: task.tags,
    sortOrder: task.sortOrder,
  };
}
