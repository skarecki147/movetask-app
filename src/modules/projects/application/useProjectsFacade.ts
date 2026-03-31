import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useProjectsQuery,
  useReorderProjectsMutation,
  useUpdateProjectMutation,
} from '@/store/movetaskApi';

export function useProjectsFacade() {
  const projects = useProjectsQuery();
  const [createProject, createState] = useCreateProjectMutation();
  const [updateProject, updateState] = useUpdateProjectMutation();
  const [deleteProject, deleteState] = useDeleteProjectMutation();
  const [reorderProjects, reorderState] = useReorderProjectsMutation();

  return {
    projects,
    createProject,
    createState,
    updateProject,
    updateState,
    deleteProject,
    deleteState,
    reorderProjects,
    reorderState,
  };
}
