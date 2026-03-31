import AsyncStorage from '@react-native-async-storage/async-storage';

import type { TaskPriority, TaskStatus } from '@/modules/tasks/domain/task';

const STORAGE_KEY = 'movetask_v1';

export type StoredUser = {
  id: string;
  email: string;
  passwordHash: string;
};

export type StoredProject = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
  sortOrder?: number;
};

export type StoredTask = {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  tags: string[];
  sortOrder: number;
};

export type AppData = {
  users: StoredUser[];
  projects: StoredProject[];
  tasks: StoredTask[];
};

let memoryCache: AppData | null = null;

function defaultData(): AppData {
  return { users: [], projects: [], tasks: [] };
}

export async function loadAppData(): Promise<AppData> {
  if (memoryCache) {
    return memoryCache;
  }
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    memoryCache = defaultData();
    return memoryCache;
  }
  try {
    const parsed = JSON.parse(raw) as AppData;
    memoryCache = {
      users: parsed.users ?? [],
      projects: parsed.projects ?? [],
      tasks: parsed.tasks ?? [],
    };
    return memoryCache;
  } catch {
    memoryCache = defaultData();
    return memoryCache;
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  memoryCache = data;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function mutateAppData(mutator: (draft: AppData) => void): Promise<AppData> {
  const current = await loadAppData();
  const next: AppData = {
    users: [...current.users],
    projects: [...current.projects],
    tasks: [...current.tasks],
  };
  mutator(next);
  await saveAppData(next);
  return next;
}

export function __resetAppDataCacheForTests(): void {
  memoryCache = null;
}
