import type { User } from '../types/user';

/** The signed-in session — always the single WorkSync system administrator (USR-001 in data/users.ts). */
export const currentUser: User = {
  id: 'USR-001',
  name: 'Admin - General',
  email: 'admin@worksync.test',
  role: 'admin',
  title: 'System Administrator'
};