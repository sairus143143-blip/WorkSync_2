import type { LucideIcon } from 'lucide-react';
import type { UserRole } from './users';

export interface NavLeaf {
  label: string;
  path: string;
  icon: LucideIcon;
  showUnread?: boolean;
  /** Roles allowed to see this item. Omit for everyone. */
  roles?: UserRole[];
}

export interface NavGroup {
  label: string;
  icon: LucideIcon;
  children: NavLeaf[];
}

export type NavEntry = NavLeaf | NavGroup;

export interface RouteMeta {
  path: string;
  title: string;
  parent?: string;
  icon: LucideIcon;
  roles?: UserRole[];
}