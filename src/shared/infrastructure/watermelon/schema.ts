import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const watermelonSchema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'users',
      columns: [
        { name: 'email', type: 'string' },
        { name: 'password_hash', type: 'string' },
      ],
    }),
    tableSchema({
      name: 'projects',
      columns: [
        { name: 'user_id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'tasks',
      columns: [
        { name: 'project_id', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'status', type: 'string' },
        { name: 'priority', type: 'string' },
        { name: 'due_date', type: 'string', isOptional: true },
        { name: 'tags_json', type: 'string' },
        { name: 'sort_order', type: 'number' },
      ],
    }),
  ],
});
