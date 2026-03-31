import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class Task extends Model {
  static table = 'tasks';

  @field('project_id') projectId!: string;
  @field('title') title!: string;
  @field('description') description?: string;
  @field('status') status!: string;
  @field('priority') priority!: string;
  @field('due_date') dueDate?: string;
  @field('tags_json') tagsJson!: string;
  @field('sort_order') sortOrder!: number;
}
