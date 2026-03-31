import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class User extends Model {
  static table = 'users';

  @field('email') email!: string;
  @field('password_hash') passwordHash!: string;
}
