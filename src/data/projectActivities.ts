import type { ProjectActivity } from '../types/projects';

/** Mock project activity log. Every action is performed by the system administrator (USR-001). */
export const projectActivities: ProjectActivity[] = [
{ id: 'ACT-001', projectId: 'PRJ-001', action: 'project_created', description: 'Admin created the project.', performedBy: 'USR-001', createdAt: '2026-10-01T08:00:00' },
{ id: 'ACT-002', projectId: 'PRJ-001', action: 'status_changed', description: 'Admin changed status to Active.', performedBy: 'USR-001', createdAt: '2026-10-01T08:10:00' },
{ id: 'ACT-003', projectId: 'PRJ-001', action: 'member_added', description: 'Admin assigned 5 employees.', performedBy: 'USR-001', createdAt: '2026-10-02T09:05:00' },
{ id: 'ACT-004', projectId: 'PRJ-001', action: 'member_removed', description: 'Admin removed Carlo Mendoza.', performedBy: 'USR-001', createdAt: '2026-10-03T10:00:00' },
{ id: 'ACT-005', projectId: 'PRJ-001', action: 'member_added', description: 'Admin assigned Maria Santos and Patricia Lim.', performedBy: 'USR-001', createdAt: '2026-10-03T10:30:00' },
{ id: 'ACT-006', projectId: 'PRJ-001', action: 'progress_updated', description: 'Admin updated project progress to 65%.', performedBy: 'USR-001', createdAt: '2026-10-05T10:00:00' },
{ id: 'ACT-007', projectId: 'PRJ-002', action: 'project_created', description: 'Admin created the project.', performedBy: 'USR-001', createdAt: '2026-05-25T09:30:00' },
{ id: 'ACT-008', projectId: 'PRJ-002', action: 'status_changed', description: 'Admin changed status to Completed.', performedBy: 'USR-001', createdAt: '2026-09-18T16:20:00' },
{ id: 'ACT-009', projectId: 'PRJ-003', action: 'project_created', description: 'Admin created the project.', performedBy: 'USR-001', createdAt: '2026-09-10T10:00:00' },
{ id: 'ACT-010', projectId: 'PRJ-003', action: 'progress_updated', description: 'Admin updated project progress to 72%.', performedBy: 'USR-001', createdAt: '2026-10-04T15:45:00' },
{ id: 'ACT-011', projectId: 'PRJ-004', action: 'project_created', description: 'Admin created the project.', performedBy: 'USR-001', createdAt: '2026-07-27T08:15:00' },
{ id: 'ACT-012', projectId: 'PRJ-004', action: 'progress_updated', description: 'Admin updated project progress to 80%.', performedBy: 'USR-001', createdAt: '2026-10-02T11:10:00' },
{ id: 'ACT-013', projectId: 'PRJ-005', action: 'project_created', description: 'Admin created the project.', performedBy: 'USR-001', createdAt: '2026-10-03T14:00:00' },
{ id: 'ACT-014', projectId: 'PRJ-006', action: 'status_changed', description: 'Admin changed status to On Hold.', performedBy: 'USR-001', createdAt: '2026-09-22T13:30:00' },
{ id: 'ACT-015', projectId: 'PRJ-007', action: 'member_added', description: 'Admin assigned Ramon Castillo.', performedBy: 'USR-001', createdAt: '2026-09-23T08:00:00' },
{ id: 'ACT-016', projectId: 'PRJ-008', action: 'progress_updated', description: 'Admin updated project progress to 90%.', performedBy: 'USR-001', createdAt: '2026-10-05T08:30:00' },
{ id: 'ACT-017', projectId: 'PRJ-009', action: 'status_changed', description: 'Admin changed status to Cancelled.', performedBy: 'USR-001', createdAt: '2026-07-14T10:05:00' },
{ id: 'ACT-018', projectId: 'PRJ-010', action: 'status_changed', description: 'Admin changed status to Completed.', performedBy: 'USR-001', createdAt: '2026-07-29T17:00:00' },
{ id: 'ACT-019', projectId: 'PRJ-011', action: 'project_created', description: 'Admin created the project.', performedBy: 'USR-001', createdAt: '2026-09-29T15:20:00' },
{ id: 'ACT-020', projectId: 'PRJ-012', action: 'status_changed', description: 'Admin changed status to On Hold.', performedBy: 'USR-001', createdAt: '2026-09-25T14:15:00' },
{ id: 'ACT-021', projectId: 'PRJ-013', action: 'project_created', description: 'Admin created the project.', performedBy: 'USR-001', createdAt: '2026-09-18T09:30:00' },
{ id: 'ACT-022', projectId: 'PRJ-013', action: 'progress_updated', description: 'Admin updated project progress to 45%.', performedBy: 'USR-001', createdAt: '2026-10-03T16:00:00' }];