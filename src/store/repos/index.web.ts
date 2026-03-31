import { AuthLocalRepository } from '@/modules/auth/infrastructure/authLocalRepository';
import { ProjectLocalRepository } from '@/modules/projects/infrastructure/projectLocalRepository';
import { createMoveTaskUseCase } from '@/modules/tasks/application/moveTaskUseCase';
import { TaskLocalRepository } from '@/modules/tasks/infrastructure/taskLocalRepository';

export const authRepository = new AuthLocalRepository();
export const projectRepository = new ProjectLocalRepository();
export const taskRepository = new TaskLocalRepository();
export const moveTask = createMoveTaskUseCase(taskRepository);
