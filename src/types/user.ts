import type { UserRole } from './users';

/** The signed-in session user. */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
}