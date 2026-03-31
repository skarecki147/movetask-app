import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useProjectsQuery,
  useUpdateProjectMutation,
} from '@/store/movetaskApi';

export function useProjectsFacade() {
  const projects = useProjectsQuery();
  const [createProject, createState] = useCreateProjectMutation();
  const [updateProject, updateState] = useUpdateProjectMutation();
  const [deleteProject, deleteState] = useDeleteProjectMutation();

  return {
    projects,
    createProject,
    createState,
    updateProject,
    updateState,
    deleteProject,
    deleteState,
  };
}
