import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class Project extends Model {
  static table = 'projects';

  @field('user_id') userId!: string;
  @field('name') name!: string;
  @field('description') description?: string;
  @field('created_at') createdAt!: number;
  @field('sort_order') sortOrder?: number;
}
