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

export class ProjectWatermelonRepository implements ProjectRepository {
  async getProjects(userId: string): Promise<DomainProject[]> {
    await ensureWatermelonReady();
    const db = getWatermelonDatabase();
    const rows = await db
      .get<Project>('projects')
      .query(Q.where('user_id', userId), Q.sortBy('created_at', Q.desc))
      .fetch();
    return rows.map((p) => storedProjectToDomain(wmProjectToStored(p)));
  }

  async createProject(input: CreateProjectInput): Promise<DomainProject> {
    await ensureWatermelonReady();
    const id = await newId();
    const createdAt = Date.now();
    const db = getWatermelonDatabase();
    await db.write(async () => {
      await db.get<Project>('projects').create((record) => {
        record._raw.id = id;
        record.userId = input.userId;
        record.name = input.name;
        record.description = input.description;
        record.createdAt = createdAt;
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
}
