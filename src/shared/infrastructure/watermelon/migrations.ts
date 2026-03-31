import { addColumns, schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

export const watermelonMigrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: 'projects',
          columns: [{ name: 'sort_order', type: 'number', isOptional: true }],
        }),
      ],
    },
  ],
});
