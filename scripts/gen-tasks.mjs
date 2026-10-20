import fs from 'fs';

const projects = [
  { id: 'PRJ-001', emps: ['EMP-001', 'EMP-008', 'EMP-011', 'EMP-014', 'EMP-002', 'EMP-010'] },
  { id: 'PRJ-002', emps: ['EMP-006', 'EMP-013', 'EMP-001'] },
  { id: 'PRJ-003', emps: ['EMP-008', 'EMP-014', 'EMP-002'] },
  { id: 'PRJ-004', emps: ['EMP-002', 'EMP-010', 'EMP-003'] },
  { id: 'PRJ-006', emps: ['EMP-002', 'EMP-004'] },
  { id: 'PRJ-007', emps: ['EMP-007', 'EMP-013', 'EMP-015'] },
  { id: 'PRJ-008', emps: ['EMP-003', 'EMP-015'] },
  { id: 'PRJ-012', emps: ['EMP-006', 'EMP-009'] },
  { id: 'PRJ-013', emps: ['EMP-007', 'EMP-011'] }
];

const titles = [
  'Implement Login Validation', 'Design Dashboard Wireframes', 'API Integration Layer', 'Write Unit Tests',
  'Database Schema Review', 'Update Documentation', 'Fix Navigation Bug', 'Prepare Sprint Demo',
  'Code Review Checklist', 'Optimize Query Performance', 'Configure CI Pipeline', 'Stakeholder Report Draft',
  'Security Audit Findings', 'Mobile Layout Polish', 'Error Handling Refactor', 'Migrate Legacy Records',
  'Onboarding Flow Update', 'Payroll Export Module', 'Attendance Sync Job', 'Inventory Tagging Script',
  'Budget Spreadsheet Merge', 'Safety Signage Inventory', 'Portal Profile Settings', 'Report Template Builder',
  'Email Notification Stub', 'Role Permission Matrix', 'Search Index Rebuild', 'Cache Invalidation Rules',
  'User Acceptance Testing', 'Release Notes Draft', 'Backup Verification', 'Load Test Scenario',
  'Accessibility Audit', 'Icon Asset Pack', 'Form Validation Rules', 'Webhook Handler',
  'Data Cleanup Script', 'Meeting Minutes Archive', 'Vendor Contract Review', 'Training Material Update',
  'Feature Flag Setup', 'Log Aggregation Config', 'Incident Response Playbook', 'Quarterly Metrics Slide',
  'Employee Directory Sync', 'Task Board Prototype', 'Deadline Reminder Logic', 'Progress Bar Component'
];

const plan = [
  ...Array(14).fill('todo'),
  ...Array(18).fill('in_progress'),
  ...Array(5).fill('in_review'),
  ...Array(10).fill('completed'),
  ...Array(1).fill('blocked')
];
for (let i = plan.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [plan[i], plan[j]] = [plan[j], plan[i]];
}

const tasks = [];
for (let i = 0; i < 48; i++) {
  const n = i + 1;
  const id = `TSK-${String(n).padStart(3, '0')}`;
  const pj = projects[i % projects.length];
  const emp = pj.emps[i % pj.emps.length];
  let status = plan[i];
  let due;
  if (i < 3) due = '2026-10-02';
  else if (i === 3) due = '2026-10-05';
  else if (i >= 4 && i < 8) due = `2026-10-${String(6 + (i - 4)).padStart(2, '0')}`;
  else due = `2026-10-${String(10 + (i % 18)).padStart(2, '0')}`;
  if (status === 'completed') due = `2026-09-${String(15 + (i % 10)).padStart(2, '0')}`;
  let progress =
    status === 'completed' ? 100 :
    status === 'todo' ? 0 :
    status === 'in_review' ? 90 :
    status === 'blocked' ? 35 :
    20 + (i * 3) % 70;
  if (progress === 100 && status !== 'completed') status = 'completed';
  if (status === 'completed') progress = 100;
  const pri = i % 7 === 0 ? 'critical' : i % 4 === 0 ? 'high' : i % 3 === 0 ? 'low' : 'medium';
  tasks.push({
    id,
    taskCode: id,
    projectId: pj.id,
    title: titles[i],
    description: `Work item for ${titles[i]}.`,
    assignedEmployeeId: emp,
    createdByUserId: 'USR-001',
    startDate: `2026-09-${String(1 + (i % 25)).padStart(2, '0')}`,
    dueDate: due,
    priority: pri,
    status,
    progress,
    createdAt: `2026-09-${String(1 + (i % 20)).padStart(2, '0')}T09:00:00`
  });
}

const body = tasks
  .map(
    (t) =>
      `{ id: '${t.id}', taskCode: '${t.taskCode}', projectId: '${t.projectId}', title: '${t.title}', description: '${t.description}', assignedEmployeeId: '${t.assignedEmployeeId}', createdByUserId: '${t.createdByUserId}', startDate: '${t.startDate}', dueDate: '${t.dueDate}', priority: '${t.priority}', status: '${t.status}', progress: ${t.progress}, createdAt: '${t.createdAt}' }`
  )
  .join(',\n');

const out = `import type { Task } from '../types/tasks';

/** Mock tasks — every task belongs to a project and assigned employee is an active project member. */
export const tasks: Task[] = [
${body}
];
`;

fs.writeFileSync(new URL('../src/data/tasks.ts', import.meta.url), out);
console.log('Wrote', tasks.length, 'tasks');
