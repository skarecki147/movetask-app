import type { Task, UpdateTaskInput } from '../domain/task';

export function sortOrderUpdatesForTodayReorder(orderedVisible: Task[], allTasks: Task[]): UpdateTaskInput[] {
  if (allTasks.length === 0) return [];

  const byProject = new Map<string, Task[]>();
  for (const t of allTasks) {
    const arr = byProject.get(t.projectId) ?? [];
    arr.push(t);
    byProject.set(t.projectId, arr);
  }

  const idToTask = new Map(allTasks.map((t) => [t.id, t]));
  const updates: UpdateTaskInput[] = [];

  for (const [projectId, projectTasks] of byProject) {
    const visibleInOrder = orderedVisible
      .filter((t) => t.projectId === projectId)
      .map((t) => idToTask.get(t.id))
      .filter((t): t is Task => t != null);

    const visibleIdSet = new Set(visibleInOrder.map((t) => t.id));
    const hidden = projectTasks
      .filter((t) => !visibleIdSet.has(t.id))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));

    const merged = [...visibleInOrder, ...hidden];
    merged.forEach((t, i) => {
      if (t.sortOrder !== i) {
        updates.push({ taskId: t.id, sortOrder: i });
      }
    });
  }

  return updates;
}
