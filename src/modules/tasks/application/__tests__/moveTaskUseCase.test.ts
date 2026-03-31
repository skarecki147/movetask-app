import { createMoveTaskUseCase } from '../moveTaskUseCase';
import type { TaskRepository } from '../../domain/taskRepository';
import type { MoveTaskInput } from '../../domain/task';

describe('createMoveTaskUseCase', () => {
  it('does not call repository when position unchanged', async () => {
    const moveTask = jest.fn();
    const repo = { moveTask } as unknown as TaskRepository;
    const run = createMoveTaskUseCase(repo);
    const input: MoveTaskInput = {
      taskId: '1',
      fromColumnId: 'todo',
      toColumnId: 'todo',
      fromIndex: 2,
      toIndex: 2,
    };
    await run(input);
    expect(moveTask).not.toHaveBeenCalled();
  });

  it('delegates to repository when position changes', async () => {
    const moveTask = jest.fn().mockResolvedValue(undefined);
    const repo = { moveTask } as unknown as TaskRepository;
    const run = createMoveTaskUseCase(repo);
    const input: MoveTaskInput = {
      taskId: '1',
      fromColumnId: 'todo',
      toColumnId: 'done',
      fromIndex: 0,
      toIndex: 0,
    };
    await run(input);
    expect(moveTask).toHaveBeenCalledWith(input);
  });
});
