import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { loadAppData, mutateAppData, type StoredUser } from '@/shared/lib/appStorage';

import type { AuthRepository } from '../domain/authRepository';
import type { Session } from '../domain/session';

const SESSION_KEY = 'movetask_session_user_id';

/** SecureStore is not supported on web the same way; use AsyncStorage to avoid thrown errors and redirect loops. */
async function readSessionUserId(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(SESSION_KEY);
  }
  return SecureStore.getItemAsync(SESSION_KEY);
}

async function writeSessionUserId(userId: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(SESSION_KEY, userId);
    return;
  }
  await SecureStore.setItemAsync(SESSION_KEY, userId);
}

async function clearSessionUserId(): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(SESSION_KEY);
    return;
  }
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

export class AuthLocalRepository implements AuthRepository {
  async getSession(): Promise<Session | null> {
    const userId = await readSessionUserId();
    if (!userId) return null;
    const data = await loadAppData();
    const user = data.users.find((u) => u.id === userId);
    if (!user) {
      await clearSessionUserId();
      return null;
    }
    return { userId: user.id, email: user.email };
  }

  async signUp(email: string, password: string): Promise<Session> {
    const normalized = email.trim().toLowerCase();
    const data = await loadAppData();
    if (data.users.some((u) => u.email.toLowerCase() === normalized)) {
      throw new Error('An account with this email already exists');
    }
    const id = await newUserId();
    const passwordHash = await hashPassword(normalized, password);
    const row: StoredUser = { id, email: normalized, passwordHash };
    await mutateAppData((d) => {
      d.users.push(row);
    });
    await writeSessionUserId(id);
    return { userId: id, email: normalized };
  }

  async signIn(email: string, password: string): Promise<Session> {
    const normalized = email.trim().toLowerCase();
    const data = await loadAppData();
    const user = data.users.find((u) => u.email.toLowerCase() === normalized);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    const passwordHash = await hashPassword(normalized, password);
    if (user.passwordHash !== passwordHash) {
      throw new Error('Invalid email or password');
    }
    await writeSessionUserId(user.id);
    return { userId: user.id, email: user.email };
  }

  async signOut(): Promise<void> {
    await clearSessionUserId();
  }
}
