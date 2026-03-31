import type { CreateTaskInput, MoveTaskInput, Task, UpdateTaskInput } from './task';

export interface TaskRepository {
  getTasks(projectId: string): Promise<Task[]>;
  createTask(input: CreateTaskInput): Promise<Task>;
  updateTask(input: UpdateTaskInput): Promise<Task>;
  moveTask(input: MoveTaskInput): Promise<void>;
  deleteTask(taskId: string): Promise<void>;
}
