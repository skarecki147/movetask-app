import type { CreateProjectInput, Project, UpdateProjectInput } from './project';

export interface ProjectRepository {
  getProjects(userId: string): Promise<Project[]>;
  createProject(input: CreateProjectInput): Promise<Project>;
  updateProject(input: UpdateProjectInput): Promise<Project>;
  deleteProject(projectId: string): Promise<void>;
  reorderProjects(userId: string, orderedProjectIds: string[]): Promise<void>;
}
