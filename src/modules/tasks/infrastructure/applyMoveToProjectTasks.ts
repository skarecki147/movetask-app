import type { StoredTask } from '@/shared/lib/appStorage';

import type { MoveTaskInput } from '../domain/task';

/** Mutates `projectTasks` in place (same project). Caller must sync elements back into the full store if needed. */
export function applyMoveToProjectTasks(projectTasks: StoredTask[], input: MoveTaskInput): void {
  const taskIdx = projectTasks.findIndex((t) => t.id === input.taskId);
  if (taskIdx < 0) return;

  const column = (status: MoveTaskInput['fromColumnId']) =>
    projectTasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));

  const fromCol = column(input.fromColumnId);
  if (fromCol[input.fromIndex]?.id !== input.taskId) return;
  const moving = fromCol[input.fromIndex];
  const fromNext = fromCol.filter((_, i) => i !== input.fromIndex);
  const toColBase =
    input.fromColumnId === input.toColumnId
      ? fromNext
      : column(input.toColumnId).filter((t) => t.id !== input.taskId);
  const moved: StoredTask = { ...moving, status: input.toColumnId };
  const boundedIndex = Math.max(0, Math.min(input.toIndex, toColBase.length));
  const toCol = [...toColBase];
  toCol.splice(boundedIndex, 0, moved);

  const reassign = (status: MoveTaskInput['fromColumnId'], rows: StoredTask[]) => {
    rows.forEach((t, i) => {
      const ix = projectTasks.findIndex((x) => x.id === t.id);
      if (ix >= 0) {
        projectTasks[ix] = {
          ...projectTasks[ix],
          status,
          sortOrder: i,
        };
      }
    });
  };

  if (input.fromColumnId === input.toColumnId) {
    reassign(input.toColumnId, toCol);
  } else {
    reassign(input.fromColumnId, fromNext);
    reassign(input.toColumnId, toCol);
  }
}
