import type { AdminArea } from '../types/assignments';

/**
 * TEMPORARY administrative responsibility areas. These are not user accounts.
 * Intended to be replaced by imported organizational data (CSV / API) without UI changes.
 */
export const adminAreas: AdminArea[] = [
{ id: 'ADMIN-AREA-IT', name: 'Information Technology', code: 'IT' },
{ id: 'ADMIN-AREA-HR', name: 'Human Resources', code: 'HR' },
{ id: 'ADMIN-AREA-FIN', name: 'Finance', code: 'FIN' },
{ id: 'ADMIN-AREA-MKT', name: 'Marketing', code: 'MKT' },
{ id: 'ADMIN-AREA-OPS', name: 'Operations', code: 'OPS' },
{ id: 'ADMIN-AREA-ADMIN', name: 'Administration', code: 'ADMIN' }];