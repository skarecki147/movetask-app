import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Q } from '@nozbe/watermelondb';

import { ensureWatermelonReady, getWatermelonDatabase } from '@/shared/infrastructure/watermelon/database.native';
import { wmUserToStored } from '@/shared/infrastructure/watermelon/wmelonMappers';

import type { User } from '@/shared/infrastructure/watermelon/models/User';

import type { AuthRepository } from '../domain/authRepository';
import type { Session } from '../domain/session';

const SESSION_KEY = 'movetask_session_user_id';

async function readSessionUserId(): Promise<string | null> {
  return SecureStore.getItemAsync(SESSION_KEY);
}

async function writeSessionUserId(userId: string): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, userId);
}

async function clearSessionUserId(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

async function hashPassword(email: string, password: string): Promise<string> {
  const payload = `${email.trim().toLowerCase()}:${password}:movetask_local_salt`;
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, payload);
}

async function newUserId(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(8);
  return `usr_${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`;
}

export class AuthWatermelonRepository implements AuthRepository {
  async getSession(): Promise<Session | null> {
    await ensureWatermelonReady();
    const userId = await readSessionUserId();
    if (!userId) return null;
    const db = getWatermelonDatabase();
    let user: User | undefined;
    try {
      user = await db.get<User>('users').find(userId);
    } catch {
      user = undefined;
    }
    if (!user) {
      await clearSessionUserId();
      return null;
    }
    const row = wmUserToStored(user);
    return { userId: row.id, email: row.email };
  }

  async signUp(email: string, password: string): Promise<Session> {
    await ensureWatermelonReady();
    const normalized = email.trim().toLowerCase();
    const db = getWatermelonDatabase();
    const existing = await db
      .get<User>('users')
      .query(Q.where('email', normalized))
      .fetch();
    if (existing.length > 0) {
      throw new Error('An account with this email already exists');
    }
    const id = await newUserId();
    const passwordHash = await hashPassword(normalized, password);
    await db.write(async () => {
      await db.get<User>('users').create((record) => {
        record._raw.id = id;
        record.email = normalized;
        record.passwordHash = passwordHash;
      });
    });
    await writeSessionUserId(id);
    return { userId: id, email: normalized };
  }

  async signIn(email: string, password: string): Promise<Session> {
    await ensureWatermelonReady();
    const normalized = email.trim().toLowerCase();
    const db = getWatermelonDatabase();
    const found = await db
      .get<User>('users')
      .query(Q.where('email', normalized))
      .fetch();
    const user = found[0];
    if (!user) {
      throw new Error('Invalid email or password');
    }
    const passwordHash = await hashPassword(normalized, password);
    if (user.passwordHash !== passwordHash) {
      throw new Error('Invalid email or password');
    }
    await writeSessionUserId(user.id);
    return { userId: user.id, email: normalized };
  }

  async signOut(): Promise<void> {
    await clearSessionUserId();
  }
}
