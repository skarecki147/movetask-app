import { skipToken } from '@reduxjs/toolkit/query';

import {
  useAllTasksForUserQuery,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useMoveTaskMutation,
  useTasksByProjectQuery,
  useUpdateTaskMutation,
} from '@/store/movetaskApi';

export function useTasksFacade(projectId: string | undefined) {
  const tasks = useTasksByProjectQuery(projectId ? projectId : skipToken);
  const [createTask, createState] = useCreateTaskMutation();
  const [updateTask, updateState] = useUpdateTaskMutation();
  const [moveTask, moveState] = useMoveTaskMutation();
  const [deleteTask, deleteState] = useDeleteTaskMutation();

  return {
    tasks,
    createTask,
    createState,
    updateTask,
    updateState,
    moveTask,
    moveState,
    deleteTask,
    deleteState,
  };
}

export function useAllTasksFacade() {
  return useAllTasksForUserQuery();
}
