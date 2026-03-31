import type { Session } from './session';

export interface AuthRepository {
  getSession(): Promise<Session | null>;
  signUp(email: string, password: string): Promise<Session>;
  signIn(email: string, password: string): Promise<Session>;
  signOut(): Promise<void>;
}
