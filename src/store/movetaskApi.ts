import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react';

import type { Session } from '@/modules/auth/domain/session';
import type { CreateProjectInput, Project, UpdateProjectInput } from '@/modules/projects/domain/project';
import type { CreateTaskInput, MoveTaskInput, Task, UpdateTaskInput } from '@/modules/tasks/domain/task';

import { authRepository, moveTask, projectRepository, taskRepository } from './repos';

const fakeBaseQuery: BaseQueryFn = async () => ({ data: null });

function unauthorized(): { error: { status: 401; data: string } } {
  return { error: { status: 401 as const, data: 'Unauthorized' } };
}

export const movetaskApi = createApi({
  reducerPath: 'movetaskApi',
  baseQuery: fakeBaseQuery,
  tagTypes: ['Session', 'Project', 'Task'],
  refetchOnFocus: false,
  endpoints: (build) => ({
    session: build.query<Session | null, void>({
      queryFn: async () => {
        try {
          const data = await authRepository.getSession();
          return { data };
        } catch {
          return { data: null };
        }
      },
      providesTags: ['Session'],
    }),

    signUp: build.mutation<Session, { email: string; password: string }>({
      queryFn: async ({ email, password }) => {
        try {
          const data = await authRepository.signUp(email, password);
          return { data };
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Sign up failed';
          return { error: { status: 400, data: message } };
        }
      },
      invalidatesTags: ['Session', 'Project', 'Task'],
    }),

    signIn: build.mutation<Session, { email: string; password: string }>({
      queryFn: async ({ email, password }) => {
        try {
          const data = await authRepository.signIn(email, password);
          return { data };
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Sign in failed';
          return { error: { status: 401, data: message } };
        }
      },
      invalidatesTags: ['Session', 'Project', 'Task'],
    }),

    signOut: build.mutation<void, void>({
      queryFn: async () => {
        await authRepository.signOut();
        return { data: null as unknown as void };
      },
      invalidatesTags: ['Session', 'Project', 'Task'],
    }),

    projects: build.query<Project[], void>({
      queryFn: async () => {
        const session = await authRepository.getSession();
        if (!session) return unauthorized();
        const data = await projectRepository.getProjects(session.userId);
        return { data };
      },
      providesTags: (result) =>
        result
          ? [...result.map((p) => ({ type: 'Project' as const, id: p.id })), 'Project']
          : ['Project'],
    }),

    createProject: build.mutation<Project, Omit<CreateProjectInput, 'userId'>>({
      queryFn: async (input) => {
        const session = await authRepository.getSession();
        if (!session) return unauthorized();
        const data = await projectRepository.createProject({ ...input, userId: session.userId });
        return { data };
      },
      invalidatesTags: ['Project'],
    }),

    updateProject: build.mutation<Project, UpdateProjectInput>({
      queryFn: async (input) => {
        const session = await authRepository.getSession();
        if (!session) return unauthorized();
        const data = await projectRepository.updateProject(input);
        return { data };
      },
      invalidatesTags: (_r, _e, arg) => [{ type: 'Project', id: arg.projectId }, 'Project'],
    }),

    deleteProject: build.mutation<void, string>({
      queryFn: async (projectId) => {
        const session = await authRepository.getSession();
        if (!session) return unauthorized();
        await projectRepository.deleteProject(projectId);
        return { data: null as unknown as void };
      },
      invalidatesTags: (_r, _e, id) => [{ type: 'Project', id }, 'Project', 'Task'],
    }),

    reorderProjects: build.mutation<void, string[]>({
      queryFn: async (orderedProjectIds) => {
        const session = await authRepository.getSession();
        if (!session) return unauthorized();
        await projectRepository.reorderProjects(session.userId, orderedProjectIds);
        return { data: null as unknown as void };
      },
      invalidatesTags: ['Project'],
    }),

    allTasksForUser: build.query<Task[], void>({
      queryFn: async () => {
        const session = await authRepository.getSession();
        if (!session) return unauthorized();
        const projects = await projectRepository.getProjects(session.userId);
        const lists = await Promise.all(projects.map((p) => taskRepository.getTasks(p.id)));
        return { data: lists.flat() };
      },
      providesTags: ['Task'],
    }),

    tasksByProject: build.query<Task[], string>({
      queryFn: async (projectId) => {
        const session = await authRepository.getSession();
        if (!session) return unauthorized();
        const data = await taskRepository.getTasks(projectId);
        return { data };
      },
      providesTags: (_r, _e, projectId) => [{ type: 'Task', id: `LIST_${projectId}` }, 'Task'],
    }),

    createTask: build.mutation<Task, CreateTaskInput>({
      queryFn: async (input) => {
        const session = await authRepository.getSession();
        if (!session) return unauthorized();
        const data = await taskRepository.createTask(input);
        return { data };
      },
      invalidatesTags: (_r, _e, arg) => [{ type: 'Task', id: `LIST_${arg.projectId}` }, 'Task'],
    }),

    updateTask: build.mutation<Task, UpdateTaskInput>({
      queryFn: async (input) => {
        const session = await authRepository.getSession();
        if (!session) return unauthorized();
        const data = await taskRepository.updateTask(input);
        return { data };
      },
      invalidatesTags: ['Task'],
    }),

    moveTask: build.mutation<void, MoveTaskInput>({
      queryFn: async (input) => {
        const session = await authRepository.getSession();
        if (!session) return unauthorized();
        await moveTask(input);
        return { data: null as unknown as void };
      },
      invalidatesTags: ['Task'],
    }),

    deleteTask: build.mutation<void, { taskId: string; projectId: string }>({
      queryFn: async ({ taskId }) => {
        const session = await authRepository.getSession();
        if (!session) return unauthorized();
        await taskRepository.deleteTask(taskId);
        return { data: null as unknown as void };
      },
      invalidatesTags: (_r, _e, arg) => [{ type: 'Task', id: `LIST_${arg.projectId}` }, 'Task'],
    }),
  }),
});

export const {
  useSessionQuery,
  useSignUpMutation,
  useSignInMutation,
  useSignOutMutation,
  useAllTasksForUserQuery,
  useProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useReorderProjectsMutation,
  useTasksByProjectQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useMoveTaskMutation,
  useDeleteTaskMutation,
} = movetaskApi;
