export type Project = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
};

export type CreateProjectInput = {
  userId: string;
  name: string;
  description?: string;
};

export type UpdateProjectInput = {
  projectId: string;
  name?: string;
  description?: string | null;
};
