import { navigation, secondaryRoutes } from '../data/navigation';
import type { NavEntry, NavGroup, RouteMeta } from '../types/navigation';
import type { UserRole } from '../types/users';

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return 'children' in entry;
}

export function isVisibleToRole(item: {roles?: UserRole[];}, role: UserRole | undefined): boolean {
  return !item.roles || role !== undefined && item.roles.includes(role);
}

export const allRoutes: RouteMeta[] = [
...navigation.flatMap((entry) =>
isNavGroup(entry) ?
entry.children.map((child) => ({ path: child.path, title: child.label, parent: entry.label, icon: child.icon, roles: child.roles })) :
[{ path: entry.path, title: entry.label, icon: entry.icon, roles: entry.roles }]
),
{ path: '/activity-logs', title: 'Activity Logs', icon: navigation.find((entry) => !('children' in entry) && entry.path === '/activity-logs')?.icon ?? navigation[0].icon, roles: ['admin'] },
...secondaryRoutes];


/** Exact match first, then the closest parent route (e.g. /projects/PRJ-001 → /projects). */
export function findRoute(pathname: string): RouteMeta | undefined {
  return (
    allRoutes.find((route) => route.path === pathname) ??
    allRoutes.
    filter((route) => pathname.startsWith(`${route.path}/`)).
    sort((a, b) => b.path.length - a.path.length)[0]);

}
