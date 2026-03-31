import { AuthWatermelonRepository } from '@/modules/auth/infrastructure/authWatermelonRepository';
import { ProjectWatermelonRepository } from '@/modules/projects/infrastructure/projectWatermelonRepository';
import { createMoveTaskUseCase } from '@/modules/tasks/application/moveTaskUseCase';
import { TaskWatermelonRepository } from '@/modules/tasks/infrastructure/taskWatermelonRepository';

export const authRepository = new AuthWatermelonRepository();
export const projectRepository = new ProjectWatermelonRepository();
export const taskRepository = new TaskWatermelonRepository();
export const moveTask = createMoveTaskUseCase(taskRepository);
