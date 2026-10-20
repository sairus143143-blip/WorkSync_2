import type { Department } from '../types/organization';

/**
 * Centralized mock departments. TEMPORARY values — the shape is intended to be
 * replaced by imported organizational data (CSV / API) without UI changes.
 * Employee and position counts are always derived, never stored here.
 */
export const departments: Department[] = [
{ id: 'DEPT-IT', name: 'Information Technology', code: 'IT', description: 'Technology and technical support operations.', status: 'active' },
{ id: 'DEPT-HR', name: 'Human Resources', code: 'HR', description: 'Recruitment, employee relations and people programs.', status: 'active' },
{ id: 'DEPT-FIN', name: 'Finance', code: 'FIN', description: 'Accounting, budgeting and financial reporting.', status: 'active' },
{ id: 'DEPT-MKT', name: 'Marketing', code: 'MKT', description: 'Brand, campaigns and digital marketing.', status: 'active' },
{ id: 'DEPT-OPS', name: 'Operations', code: 'OPS', description: 'Day-to-day operations, logistics and facilities.', status: 'active' },
{ id: 'DEPT-ADMIN', name: 'Administration', code: 'ADMIN', description: 'Office administration and records management.', status: 'active' }];