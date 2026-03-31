import * as Crypto from 'expo-crypto';
import { Q } from '@nozbe/watermelondb';

import { ensureWatermelonReady, getWatermelonDatabase } from '@/shared/infrastructure/watermelon/database.native';
import type { Task as TaskModel } from '@/shared/infrastructure/watermelon/models/Task';
import { wmTaskToStored } from '@/shared/infrastructure/watermelon/wmelonMappers';
import type { StoredTask } from '@/shared/lib/appStorage';

import type { CreateTaskInput, MoveTaskInput, Task, UpdateTaskInput } from '../domain/task';
import type { TaskRepository } from '../domain/taskRepository';

import { applyMoveToProjectTasks } from './applyMoveToProjectTasks';
import { storedTaskToDomain } from './taskDtoMapper';

async function newId(prefix: string): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(8);
  return `${prefix}_${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`;
}

export class TaskWatermelonRepository implements TaskRepository {
  async getTasks(projectId: string): Promise<Task[]> {
    await ensureWatermelonReady();
    const db = getWatermelonDatabase();
    const rows = await db
      .get<TaskModel>('tasks')
      .query(Q.where('project_id', projectId))
      .fetch();
    return rows
      .map((t) => storedTaskToDomain(wmTaskToStored(t)))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
  }

  async createTask(input: CreateTaskInput): Promise<Task> {
    await ensureWatermelonReady();
    const db = getWatermelonDatabase();
    const existing = await db
      .get<TaskModel>('tasks')
      .query(Q.where('project_id', input.projectId))
      .fetch();
    const maxOrder = existing.reduce((m, t) => Math.max(m, t.sortOrder), -1);
    const id = await newId('task');
    const status = input.status ?? 'todo';
    const priority = input.priority ?? 'medium';
    const tags = input.tags ?? [];
    await db.write(async () => {
      await db.get<TaskModel>('tasks').create((record) => {
        record._raw.id = id;
        record.projectId = input.projectId;
        record.title = input.title;
        record.description = input.description;
        record.status = status;
        record.priority = priority;
        record.dueDate = input.dueDate;
        record.tagsJson = JSON.stringify(tags);
        record.sortOrder = maxOrder + 1;
      });
    });
    const row = wmTaskToStored(await db.get<TaskModel>('tasks').find(id));
    return storedTaskToDomain(row);
  }

  async updateTask(input: UpdateTaskInput): Promise<Task> {
    await ensureWatermelonReady();
    const db = getWatermelonDatabase();
    await db.write(async () => {
      const task = await db.get<TaskModel>('tasks').find(input.taskId);
      await task.update((record) => {
        if (input.title !== undefined) record.title = input.title;
        if (input.description !== undefined) record.description = input.description;
        if (input.status !== undefined) record.status = input.status;
        if (input.priority !== undefined) record.priority = input.priority;
        if (input.dueDate !== undefined) {
          record.dueDate = input.dueDate === null ? undefined : input.dueDate;
        }
        if (input.tags !== undefined) record.tagsJson = JSON.stringify(input.tags);
        if (input.sortOrder !== undefined) record.sortOrder = input.sortOrder;
      });
    });
    const updated = await db.get<TaskModel>('tasks').find(input.taskId);
    return storedTaskToDomain(wmTaskToStored(updated));
  }

  async moveTask(input: MoveTaskInput): Promise<void> {
    await ensureWatermelonReady();
    const db = getWatermelonDatabase();
    await db.write(async () => {
      let primary: TaskModel;
      try {
        primary = await db.get<TaskModel>('tasks').find(input.taskId);
      } catch {
        return;
      }
      const pid = primary.projectId;
      const wmRows = await db
        .get<TaskModel>('tasks')
        .query(Q.where('project_id', pid))
        .fetch();
      const projectTasks: StoredTask[] = wmRows.map((t) => {
        const s = wmTaskToStored(t);
        return { ...s, tags: [...s.tags] };
      });
      applyMoveToProjectTasks(projectTasks, input);
      for (const t of projectTasks) {
        const m = await db.get<TaskModel>('tasks').find(t.id);
        await m.update((record) => {
          record.status = t.status;
          record.sortOrder = t.sortOrder;
          record.tagsJson = JSON.stringify(t.tags);
        });
      }
    });
  }

  async deleteTask(taskId: string): Promise<void> {
    await ensureWatermelonReady();
    const db = getWatermelonDatabase();
    try {
      await db.write(async () => {
        const task = await db.get<TaskModel>('tasks').find(taskId);
        await task.destroyPermanently();
      });
    } catch {
      /* missing id — same as JSON filter no-op */
    }
  }
}
