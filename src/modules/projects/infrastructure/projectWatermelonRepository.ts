import * as Crypto from 'expo-crypto';
import { Q } from '@nozbe/watermelondb';

import { ensureWatermelonReady, getWatermelonDatabase } from '@/shared/infrastructure/watermelon/database.native';
import type { Project } from '@/shared/infrastructure/watermelon/models/Project';
import type { Task as TaskModel } from '@/shared/infrastructure/watermelon/models/Task';
import { wmProjectToStored } from '@/shared/infrastructure/watermelon/wmelonMappers';

import type { CreateProjectInput, Project as DomainProject, UpdateProjectInput } from '../domain/project';
import type { ProjectRepository } from '../domain/projectRepository';

import { storedProjectToDomain } from './projectMapper';

async function newId(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(8);
  return `proj_${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`;
}

function compareWatermelonProjects(a: Project, b: Project): number {
  const ao = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
  const bo = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
  if (ao !== bo) return ao - bo;
  return b.createdAt - a.createdAt;
}

async function ensureWatermelonProjectSortOrders(userId: string): Promise<void> {
  await ensureWatermelonReady();
  const db = getWatermelonDatabase();
  const rows = await db.get<Project>('projects').query(Q.where('user_id', userId)).fetch();
  if (!rows.some((r) => r.sortOrder == null)) return;
  const sorted = [...rows].sort((a, b) => b.createdAt - a.createdAt);
  await db.write(async () => {
    for (let i = 0; i < sorted.length; i++) {
      await sorted[i].update((record) => {
        record.sortOrder = i;
      });
    }
  });
}

export class ProjectWatermelonRepository implements ProjectRepository {
  async getProjects(userId: string): Promise<DomainProject[]> {
    await ensureWatermelonReady();
    await ensureWatermelonProjectSortOrders(userId);
    const db = getWatermelonDatabase();
    const rows = await db.get<Project>('projects').query(Q.where('user_id', userId)).fetch();
    return [...rows].sort(compareWatermelonProjects).map((p) => storedProjectToDomain(wmProjectToStored(p)));
  }

  async createProject(input: CreateProjectInput): Promise<DomainProject> {
    await ensureWatermelonReady();
    await ensureWatermelonProjectSortOrders(input.userId);
    const db = getWatermelonDatabase();
    const existing = await db.get<Project>('projects').query(Q.where('user_id', input.userId)).fetch();
    const maxOrder = existing.reduce((m, p) => Math.max(m, p.sortOrder ?? -1), -1);
    const id = await newId();
    const createdAt = Date.now();
    await db.write(async () => {
      await db.get<Project>('projects').create((record) => {
        record._raw.id = id;
        record.userId = input.userId;
        record.name = input.name;
        record.description = input.description;
        record.createdAt = createdAt;
        record.sortOrder = maxOrder + 1;
      });
    });
    const row = wmProjectToStored(await db.get<Project>('projects').find(id));
    return storedProjectToDomain(row);
  }

  async updateProject(input: UpdateProjectInput): Promise<DomainProject> {
    await ensureWatermelonReady();
    const db = getWatermelonDatabase();
    await db.write(async () => {
      const project = await db.get<Project>('projects').find(input.projectId);
      await project.update((record) => {
        if (input.name !== undefined) record.name = input.name;
        if (input.description !== undefined) {
          record.description = input.description === null ? undefined : input.description;
        }
      });
    });
    const updated = await db.get<Project>('projects').find(input.projectId);
    return storedProjectToDomain(wmProjectToStored(updated));
  }

  async deleteProject(projectId: string): Promise<void> {
    await ensureWatermelonReady();
    const db = getWatermelonDatabase();
    await db.write(async () => {
      const taskRows = await db
        .get<TaskModel>('tasks')
        .query(Q.where('project_id', projectId))
        .fetch();
      for (const t of taskRows) {
        await t.destroyPermanently();
      }
      const project = await db.get<Project>('projects').find(projectId);
      await project.destroyPermanently();
    });
  }

  async reorderProjects(userId: string, orderedProjectIds: string[]): Promise<void> {
    await ensureWatermelonReady();
    await ensureWatermelonProjectSortOrders(userId);
    const db = getWatermelonDatabase();
    const rows = await db.get<Project>('projects').query(Q.where('user_id', userId)).fetch();
    const mine = new Set(rows.map((r) => r.id));
    if (orderedProjectIds.length !== mine.size) {
      throw new Error('Invalid project order');
    }
    for (const id of orderedProjectIds) {
      if (!mine.has(id)) throw new Error('Invalid project order');
    }
    await db.write(async () => {
      for (let i = 0; i < orderedProjectIds.length; i++) {
        const project = await db.get<Project>('projects').find(orderedProjectIds[i]);
        await project.update((record) => {
          record.sortOrder = i;
        });
      }
    });
  }
}
