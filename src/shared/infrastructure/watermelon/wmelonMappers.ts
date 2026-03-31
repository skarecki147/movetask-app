import type { TaskPriority, TaskStatus } from '@/modules/tasks/domain/task';
import type { StoredProject, StoredTask, StoredUser } from '@/shared/lib/appStorage';

import type { Project as ProjectModel } from './models/Project';
import type { Task as TaskModel } from './models/Task';
import type { User as UserModel } from './models/User';

export function wmUserToStored(u: UserModel): StoredUser {
  return {
    id: u.id,
    email: u.email,
    passwordHash: u.passwordHash,
  };
}

export function wmProjectToStored(p: ProjectModel): StoredProject {
  return {
    id: p.id,
    userId: p.userId,
    name: p.name,
    description: p.description,
    createdAt: new Date(p.createdAt).toISOString(),
    sortOrder: p.sortOrder,
  };
}

export function wmTaskToStored(t: TaskModel): StoredTask {
  let tags: string[] = [];
  try {
    tags = JSON.parse(t.tagsJson || '[]') as string[];
  } catch {
    tags = [];
  }
  return {
    id: t.id,
    projectId: t.projectId,
    title: t.title,
    description: t.description,
    status: t.status as TaskStatus,
    priority: t.priority as TaskPriority,
    dueDate: t.dueDate,
    tags,
    sortOrder: t.sortOrder,
  };
}
