import type { SystemUser } from '../types/users';

/**
 * Centralized mock user accounts. Replace with an API response later.
 * RULE: exactly one object may have role "admin" — the protected system administrator.
 * Workforce details (position and contact info) live in data/employees.ts, linked by userId.
 */
export const users: SystemUser[] = [
{ id: 'USR-001', firstName: 'Admin', lastName: 'General', email: 'admin@worksync.test', role: 'admin', status: 'active', createdAt: '2026-01-01', lastActivity: '2026-10-04T08:00:00', mockPassword: 'admin123' },
{ id: 'USR-002', firstName: 'Juan', lastName: 'Dela Cruz', email: 'juan@worksync.test', role: 'employee', status: 'active', createdAt: '2026-01-15', lastActivity: '2026-10-04T08:15:00', mockPassword: 'employee123' },
{ id: 'USR-003', firstName: 'Maria', lastName: 'Santos', email: 'maria@worksync.test', role: 'employee', status: 'active', createdAt: '2026-02-10', lastActivity: '2026-10-04T09:02:00' },
{ id: 'USR-004', firstName: 'Pedro', lastName: 'Garcia', email: 'pedro@worksync.test', role: 'employee', status: 'active', createdAt: '2026-03-05', lastActivity: '2026-10-04T08:52:00' },
{ id: 'USR-005', firstName: 'Anna', lastName: 'Reyes', email: 'anna@worksync.test', role: 'employee', status: 'active', createdAt: '2026-04-12', lastActivity: '2026-09-18T17:40:00' },
{ id: 'USR-006', firstName: 'Carlo', lastName: 'Mendoza', email: 'carlo@worksync.test', role: 'employee', status: 'active', createdAt: '2026-05-20', lastActivity: '2026-10-03T18:05:00' },
{ id: 'USR-007', firstName: 'Liza', lastName: 'Ramos', email: 'liza@worksync.test', role: 'employee', status: 'active', createdAt: '2026-06-02', lastActivity: '2026-10-04T07:58:00' },
{ id: 'USR-008', firstName: 'Jose', lastName: 'Bautista', email: 'jose@worksync.test', role: 'employee', status: 'active', createdAt: '2026-06-15', lastActivity: '2026-09-25T16:20:00' },
{ id: 'USR-009', firstName: 'Kristine', lastName: 'Villanueva', email: 'kristine@worksync.test', role: 'employee', status: 'active', createdAt: '2026-07-01', lastActivity: '2026-10-04T08:31:00' },
{ id: 'USR-010', firstName: 'Mark', lastName: 'Aquino', email: 'mark@worksync.test', role: 'employee', status: 'inactive', createdAt: '2026-03-28', lastActivity: '2026-07-30T12:10:00' },
{ id: 'USR-011', firstName: 'Patricia', lastName: 'Lim', email: 'patricia@worksync.test', role: 'employee', status: 'active', createdAt: '2026-08-11', lastActivity: '2026-10-03T11:45:00' },
{ id: 'USR-012', firstName: 'Miguel', lastName: 'Torres', email: 'miguel@worksync.test', role: 'employee', status: 'active', createdAt: '2026-08-25', lastActivity: '2026-10-04T08:47:00' },
{ id: 'USR-013', firstName: 'Rosa', lastName: 'Navarro', email: 'rosa@worksync.test', role: 'employee', status: 'inactive', createdAt: '2026-01-20', lastActivity: '2026-06-05T09:00:00' },
{ id: 'USR-014', firstName: 'Ramon', lastName: 'Castillo', email: 'ramon@worksync.test', role: 'employee', status: 'active', createdAt: '2026-09-22', lastActivity: null },
{ id: 'USR-015', firstName: 'Daniel', lastName: 'Flores', email: 'daniel@worksync.test', role: 'employee', status: 'active', createdAt: '2026-02-23', lastActivity: '2026-10-04T08:05:00' },
{ id: 'USR-016', firstName: 'Grace', lastName: 'Mercado', email: 'grace@worksync.test', role: 'employee', status: 'active', createdAt: '2026-05-04', lastActivity: '2026-10-03T17:12:00' }];
