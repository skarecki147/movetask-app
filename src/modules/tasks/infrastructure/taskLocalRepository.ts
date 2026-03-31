import * as Crypto from 'expo-crypto';

import { loadAppData, mutateAppData, type StoredTask } from '@/shared/lib/appStorage';

import type { CreateTaskInput, MoveTaskInput, Task, UpdateTaskInput } from '../domain/task';
import type { TaskRepository } from '../domain/taskRepository';

import { applyMoveToProjectTasks } from './applyMoveToProjectTasks';
import { storedTaskToDomain } from './taskDtoMapper';

async function newId(prefix: string): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(8);
  return `${prefix}_${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`;
}

export class TaskLocalRepository implements TaskRepository {
  async getTasks(projectId: string): Promise<Task[]> {
    const data = await loadAppData();
    return data.tasks
      .filter((t) => t.projectId === projectId)
      .map(storedTaskToDomain)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
  }

  async createTask(input: CreateTaskInput): Promise<Task> {
    const data = await loadAppData();
    const existing = data.tasks.filter((t) => t.projectId === input.projectId);
    const maxOrder = existing.reduce((m, t) => Math.max(m, t.sortOrder), -1);
    const id = await newId('task');
    const row: StoredTask = {
      id,
      projectId: input.projectId,
      title: input.title,
      description: input.description,
      status: input.status ?? 'todo',
      priority: input.priority ?? 'medium',
      dueDate: input.dueDate,
      tags: input.tags ?? [],
      sortOrder: maxOrder + 1,
    };
    await mutateAppData((d) => {
      d.tasks.push(row);
    });
    return storedTaskToDomain(row);
  }

  async updateTask(input: UpdateTaskInput): Promise<Task> {
    let updated: StoredTask | undefined;
    await mutateAppData((d) => {
      const idx = d.tasks.findIndex((t) => t.id === input.taskId);
      if (idx === -1) return;
      const cur = d.tasks[idx];
      const next: StoredTask = {
        ...cur,
        title: input.title ?? cur.title,
        description: input.description !== undefined ? input.description : cur.description,
        status: input.status ?? cur.status,
        priority: input.priority ?? cur.priority,
        dueDate:
          input.dueDate === null ? undefined : input.dueDate !== undefined ? input.dueDate : cur.dueDate,
        tags: input.tags ?? cur.tags,
        sortOrder: input.sortOrder ?? cur.sortOrder,
      };
      d.tasks[idx] = next;
      updated = next;
    });
    if (!updated) {
      throw new Error('Task not found');
    }
    return storedTaskToDomain(updated);
  }

  async moveTask(input: MoveTaskInput): Promise<void> {
    await mutateAppData((d) => {
      const taskIdx = d.tasks.findIndex((t) => t.id === input.taskId);
      if (taskIdx < 0) return;
      const pid = d.tasks[taskIdx].projectId;
      const projectTasks = d.tasks.filter((t) => t.projectId === pid);
      applyMoveToProjectTasks(projectTasks, input);
      for (const t of projectTasks) {
        const g = d.tasks.findIndex((x) => x.id === t.id);
        if (g >= 0) d.tasks[g] = t;
      }
    });
  }

  async deleteTask(taskId: string): Promise<void> {
    await mutateAppData((d) => {
      d.tasks = d.tasks.filter((t) => t.id !== taskId);
    });
  }
}
