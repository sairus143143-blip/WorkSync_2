import type { PositionAdminAssignment } from '../types/assignments';

/**
 * TEMPORARY position → administrative area assignments, keyed by stable IDs.
 * Software Developer, Marketing Coordinator and Operations Coordinator are intentionally
 * left unassigned. Replace with CSV-derived data later.
 */
export const positionAdminAssignments: PositionAdminAssignment[] = [
{ id: 'ASSIGN-001', positionId: 'POS-IT-001', departmentId: 'DEPT-IT', adminAreaId: 'ADMIN-AREA-IT', status: 'assigned', updatedAt: '2026-10-05T09:00:00' },
{ id: 'ASSIGN-002', positionId: 'POS-HR-001', departmentId: 'DEPT-HR', adminAreaId: 'ADMIN-AREA-HR', status: 'assigned', updatedAt: '2026-10-05T09:05:00' },
{ id: 'ASSIGN-003', positionId: 'POS-FIN-001', departmentId: 'DEPT-FIN', adminAreaId: 'ADMIN-AREA-FIN', status: 'assigned', updatedAt: '2026-10-05T09:10:00' },
{ id: 'ASSIGN-004', positionId: 'POS-MKT-001', departmentId: 'DEPT-MKT', adminAreaId: 'ADMIN-AREA-MKT', status: 'assigned', updatedAt: '2026-10-05T09:15:00' },
{ id: 'ASSIGN-005', positionId: 'POS-OPS-001', departmentId: 'DEPT-OPS', adminAreaId: 'ADMIN-AREA-OPS', status: 'assigned', updatedAt: '2026-10-05T09:20:00' },
{ id: 'ASSIGN-006', positionId: 'POS-ADMIN-001', departmentId: 'DEPT-ADMIN', adminAreaId: 'ADMIN-AREA-ADMIN', status: 'assigned', updatedAt: '2026-10-05T09:25:00' },
{ id: 'ASSIGN-007', positionId: 'POS-IT-002', departmentId: 'DEPT-IT', adminAreaId: 'ADMIN-AREA-IT', status: 'assigned', updatedAt: '2026-10-02T14:30:00' },
{ id: 'ASSIGN-008', positionId: 'POS-IT-004', departmentId: 'DEPT-IT', adminAreaId: 'ADMIN-AREA-IT', status: 'assigned', updatedAt: '2026-10-02T14:32:00' },
{ id: 'ASSIGN-009', positionId: 'POS-HR-002', departmentId: 'DEPT-HR', adminAreaId: 'ADMIN-AREA-HR', status: 'assigned', updatedAt: '2026-09-28T10:00:00' },
{ id: 'ASSIGN-010', positionId: 'POS-HR-003', departmentId: 'DEPT-HR', adminAreaId: 'ADMIN-AREA-HR', status: 'assigned', updatedAt: '2026-09-28T10:04:00' },
{ id: 'ASSIGN-011', positionId: 'POS-FIN-002', departmentId: 'DEPT-FIN', adminAreaId: 'ADMIN-AREA-FIN', status: 'assigned', updatedAt: '2026-09-30T11:12:00' },
{ id: 'ASSIGN-012', positionId: 'POS-FIN-003', departmentId: 'DEPT-FIN', adminAreaId: 'ADMIN-AREA-FIN', status: 'inactive', updatedAt: '2026-08-14T16:45:00' },
{ id: 'ASSIGN-013', positionId: 'POS-MKT-002', departmentId: 'DEPT-MKT', adminAreaId: 'ADMIN-AREA-MKT', status: 'assigned', updatedAt: '2026-09-25T08:40:00' },
{ id: 'ASSIGN-014', positionId: 'POS-OPS-002', departmentId: 'DEPT-OPS', adminAreaId: 'ADMIN-AREA-OPS', status: 'assigned', updatedAt: '2026-09-22T13:05:00' },
{ id: 'ASSIGN-015', positionId: 'POS-ADMIN-002', departmentId: 'DEPT-ADMIN', adminAreaId: 'ADMIN-AREA-ADMIN', status: 'assigned', updatedAt: '2026-09-20T09:50:00' },
{ id: 'ASSIGN-016', positionId: 'POS-ADMIN-003', departmentId: 'DEPT-ADMIN', adminAreaId: 'ADMIN-AREA-ADMIN', status: 'assigned', updatedAt: '2026-09-20T09:55:00' }];