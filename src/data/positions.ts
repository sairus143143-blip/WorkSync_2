import type { Position } from '../types/organization';

/**
 * Centralized mock job titles. Employee counts are derived from employee records, never stored here.
 */
export const positions: Position[] = [
{ id: 'POS-IT-001', code: 'POS-IT-001', name: 'IT Support Specialist', description: 'Provides technical support to employees.', status: 'active' },
{ id: 'POS-IT-002', code: 'POS-IT-002', name: 'Network Administrator', description: 'Maintains network infrastructure and connectivity.', status: 'active' },
{ id: 'POS-IT-003', code: 'POS-IT-003', name: 'Software Developer', description: 'Builds and maintains internal software systems.', status: 'active' },
{ id: 'POS-IT-004', code: 'POS-IT-004', name: 'IT Technician', description: 'Installs and repairs hardware and peripherals.', status: 'active' },
{ id: 'POS-HR-001', code: 'POS-HR-001', name: 'HR Assistant', description: 'Supports HR records and onboarding tasks.', status: 'active' },
{ id: 'POS-HR-002', code: 'POS-HR-002', name: 'HR Officer', description: 'Handles employee relations and HR policy.', status: 'active' },
{ id: 'POS-HR-003', code: 'POS-HR-003', name: 'Recruitment Assistant', description: 'Coordinates job postings and interviews.', status: 'active' },
{ id: 'POS-FIN-001', code: 'POS-FIN-001', name: 'Accountant', description: 'Prepares financial statements and reconciliations.', status: 'active' },
{ id: 'POS-FIN-002', code: 'POS-FIN-002', name: 'Finance Assistant', description: 'Processes payments and supports budgeting.', status: 'active' },
{ id: 'POS-FIN-003', code: 'POS-FIN-003', name: 'Accounting Clerk', description: 'Records transactions and maintains ledgers.', status: 'inactive' },
{ id: 'POS-MKT-001', code: 'POS-MKT-001', name: 'Marketing Associate', description: 'Executes marketing campaigns and content.', status: 'active' },
{ id: 'POS-MKT-002', code: 'POS-MKT-002', name: 'Digital Marketing Assistant', description: 'Manages social media and online ads.', status: 'active' },
{ id: 'POS-MKT-003', code: 'POS-MKT-003', name: 'Marketing Coordinator', description: 'Plans campaign schedules and vendor work.', status: 'active' },
{ id: 'POS-OPS-001', code: 'POS-OPS-001', name: 'Operations Staff', description: 'Carries out daily operational tasks.', status: 'active' },
{ id: 'POS-OPS-002', code: 'POS-OPS-002', name: 'Operations Assistant', description: 'Supports logistics and inventory processes.', status: 'active' },
{ id: 'POS-OPS-003', code: 'POS-OPS-003', name: 'Operations Coordinator', description: 'Coordinates schedules across operations teams.', status: 'active' },
{ id: 'POS-ADMIN-001', code: 'POS-ADMIN-001', name: 'Administrative Assistant', description: 'Provides clerical and scheduling support.', status: 'active' },
{ id: 'POS-ADMIN-002', code: 'POS-ADMIN-002', name: 'Office Clerk', description: 'Handles filing, mail and front-desk duties.', status: 'active' },
{ id: 'POS-ADMIN-003', code: 'POS-ADMIN-003', name: 'Administrative Officer', description: 'Oversees office administration processes.', status: 'active' }];