import type { StoredProject } from '@/shared/lib/appStorage';

import type { Project } from '../domain/project';

export function storedProjectToDomain(row: StoredProject): Project {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    description: row.description,
    createdAt: row.createdAt,
  };
}
