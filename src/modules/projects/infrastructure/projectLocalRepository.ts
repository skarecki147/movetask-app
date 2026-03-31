import * as Crypto from 'expo-crypto';

import { loadAppData, mutateAppData, type StoredProject } from '@/shared/lib/appStorage';

import type { CreateProjectInput, Project, UpdateProjectInput } from '../domain/project';
import type { ProjectRepository } from '../domain/projectRepository';

import { storedProjectToDomain } from './projectMapper';

async function newId(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(8);
  return `proj_${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`;
}

async function ensureProjectSortOrders(userId: string): Promise<void> {
  await mutateAppData((d) => {
    const mine = d.projects.filter((p) => p.userId === userId);
    if (mine.length === 0 || mine.every((p) => p.sortOrder !== undefined)) return;
    const sorted = [...mine].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    sorted.forEach((p, i) => {
      const idx = d.projects.findIndex((x) => x.id === p.id);
      if (idx >= 0) {
        d.projects[idx] = { ...d.projects[idx], sortOrder: i };
      }
    });
  });
}

function compareProjects(a: Project, b: Project): number {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return b.createdAt.localeCompare(a.createdAt);
}

export class ProjectLocalRepository implements ProjectRepository {
  async getProjects(userId: string): Promise<Project[]> {
    await ensureProjectSortOrders(userId);
    const data = await loadAppData();
    return data.projects
      .filter((p) => p.userId === userId)
      .map(storedProjectToDomain)
      .sort(compareProjects);
  }

  async createProject(input: CreateProjectInput): Promise<Project> {
    const data = await loadAppData();
    const mine = data.projects.filter((p) => p.userId === input.userId);
    const maxOrder = mine.reduce((m, p) => Math.max(m, p.sortOrder ?? -1), -1);
    const id = await newId();
    const row: StoredProject = {
      id,
      userId: input.userId,
      name: input.name,
      description: input.description,
      createdAt: new Date().toISOString(),
      sortOrder: maxOrder + 1,
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

  async reorderProjects(userId: string, orderedProjectIds: string[]): Promise<void> {
    await ensureProjectSortOrders(userId);
    const data = await loadAppData();
    const mine = new Set(data.projects.filter((p) => p.userId === userId).map((p) => p.id));
    if (orderedProjectIds.length !== mine.size) {
      throw new Error('Invalid project order');
    }
    for (const id of orderedProjectIds) {
      if (!mine.has(id)) throw new Error('Invalid project order');
    }
    await mutateAppData((d) => {
      orderedProjectIds.forEach((id, i) => {
        const idx = d.projects.findIndex((p) => p.id === id);
        if (idx >= 0) {
          d.projects[idx] = { ...d.projects[idx], sortOrder: i };
        }
      });
    });
  }
}
