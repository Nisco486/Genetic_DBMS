import { User, UserRole } from '@/types/auth';
import bcrypt from 'bcryptjs';

interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  createdAt: string;
}

const USERS_KEY = 'auth_users';
const SESSION_KEY = 'auth_session';

let userCache: StoredUser[] | null = null;

const getWindow = () => (typeof window !== 'undefined' ? window : null);

const readUsers = (): StoredUser[] => {
  if (userCache) return userCache;
  const win = getWindow();
  if (!win) return [];
  try {
    const raw = win.localStorage.getItem(USERS_KEY);
    userCache = raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    userCache = [];
  }
  return userCache;
};

const writeUsers = (users: StoredUser[]) => {
  userCache = users;
  const win = getWindow();
  if (!win) return;
  try {
    win.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    /* ignore persistence errors */
  }
};

export const findUser = (email: string) => {
  return readUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
};

export const authenticateUser = (email: string, password: string, role: UserRole) => {
  const user = findUser(email);
  if (user && bcrypt.compareSync(password, user.passwordHash) && user.role === role) {
    const { passwordHash: _pw, ...safeUser } = user;
    return { user: safeUser as User };
  }
  return { error: 'Invalid email or password.' };
};

export const createUser = (user: Omit<StoredUser, 'passwordHash' | 'createdAt'>, password: string) => {
  const existing = findUser(user.email);
  if (existing) {
    return { error: 'Account already exists. Please log in.' };
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const users = readUsers();
  const nextUsers: StoredUser[] = [
    ...users,
    {
      ...user,
      passwordHash,
      createdAt: new Date().toISOString(),
    },
  ];
  writeUsers(nextUsers);
  const { passwordHash: _pw, ...safeUser } = nextUsers[nextUsers.length - 1];
  return { user: safeUser as User };
};

export const loadSession = () => {
  const win = getWindow();
  if (!win) return null;
  try {
    const raw = win.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

export const persistSession = (user: User) => {
  const win = getWindow();
  if (!win) return;
  try {
    win.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
};

export const clearSession = () => {
  const win = getWindow();
  if (!win) return;
  try {
    win.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
};

