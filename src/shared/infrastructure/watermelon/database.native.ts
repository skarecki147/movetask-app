import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { Platform } from 'react-native';

import { Project } from './models/Project';
import { Task } from './models/Task';
import { User } from './models/User';
import { watermelonMigrations } from './migrations';
import { watermelonSchema } from './schema';

let database: Database | null = null;

export function getWatermelonDatabase(): Database {
  if (!database) {
    const adapter = new SQLiteAdapter({
      schema: watermelonSchema,
      migrations: watermelonMigrations,
      dbName: 'movetask',
      jsi: Platform.OS === 'ios',
      onSetUpError: (error) => {
        console.error('[WatermelonDB] setup error', error);
      },
    });
    database = new Database({
      adapter,
      modelClasses: [User, Project, Task],
    });
  }
  return database;
}

export async function ensureWatermelonReady(): Promise<void> {
  getWatermelonDatabase();
}
