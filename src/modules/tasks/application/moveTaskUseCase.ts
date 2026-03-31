import type { TaskRepository } from '../domain/taskRepository';
import type { MoveTaskInput } from '../domain/task';

export const createMoveTaskUseCase =
  (repository: TaskRepository) =>
  async (input: MoveTaskInput): Promise<void> => {
    const isSamePosition =
      input.fromColumnId === input.toColumnId &&
      input.fromIndex === input.toIndex;

    if (isSamePosition) return;

    await repository.moveTask(input);
  };
