import * as Crypto from 'expo-crypto';

import { loadAppData, mutateAppData, type StoredProject } from '@/shared/lib/appStorage';

import type { CreateProjectInput, Project, UpdateProjectInput } from '../domain/project';
import type { ProjectRepository } from '../domain/projectRepository';

import { storedProjectToDomain } from './projectMapper';

async function newId(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(8);
  return `proj_${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`;
}

export class ProjectLocalRepository implements ProjectRepository {
  async getProjects(userId: string): Promise<Project[]> {
    const data = await loadAppData();
    return data.projects
      .filter((p) => p.userId === userId)
      .map(storedProjectToDomain)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createProject(input: CreateProjectInput): Promise<Project> {
    const id = await newId();
    const row: StoredProject = {
      id,
      userId: input.userId,
      name: input.name,
      description: input.description,
      createdAt: new Date().toISOString(),
    };
    await mutateAppData((d) => {
      d.projects.push(row);
    });
    return storedProjectToDomain(row);
  }

  async updateProject(input: UpdateProjectInput): Promise<Project> {
    let updated: StoredProject | undefined;
    await mutateAppData((d) => {
      const idx = d.projects.findIndex((p) => p.id === input.projectId);
      if (idx === -1) return;
      const cur = d.projects[idx];
      const next: StoredProject = {
        ...cur,
        name: input.name ?? cur.name,
        description:
          input.description === null ? undefined : input.description !== undefined ? input.description : cur.description,
      };
      d.projects[idx] = next;
      updated = next;
    });
    if (!updated) throw new Error('Project not found');
    return storedProjectToDomain(updated);
  }

  async deleteProject(projectId: string): Promise<void> {
    await mutateAppData((d) => {
      d.projects = d.projects.filter((p) => p.id !== projectId);
      d.tasks = d.tasks.filter((t) => t.projectId !== projectId);
    });
  }
}
