import fs from 'fs';
import { tasks } from '../src/data/tasks.ts';

let act = 1;
const rows = [];
for (const t of tasks) {
  rows.push({
    id: `TA-${String(act++).padStart(3, '0')}`,
    taskId: t.id,
    type: 'created',
    description: 'Task created.',
    createdByUserId: 'USR-001',
    createdAt: t.createdAt
  });
  rows.push({
    id: `TA-${String(act++).padStart(3, '0')}`,
    taskId: t.id,
    type: 'assigned',
    description: 'Task assigned.',
    createdByUserId: 'USR-001',
    createdAt: t.createdAt
  });
  if (t.status !== 'todo') {
    rows.push({
      id: `TA-${String(act++).padStart(3, '0')}`,
      taskId: t.id,
      type: 'status_changed',
      description: `Status changed to ${t.status.replace('_', ' ')}.`,
      createdByUserId: 'USR-001',
      createdAt: `${t.startDate}T14:00:00`
    });
  }
  if (t.progress > 0) {
    rows.push({
      id: `TA-${String(act++).padStart(3, '0')}`,
      taskId: t.id,
      type: 'progress_updated',
      description: `Progress updated to ${t.progress}%.`,
      createdByUserId: 'USR-001',
      createdAt: `${t.startDate}T16:00:00`
    });
  }
}

const body = rows
  .map(
    (r) =>
      `{ id: '${r.id}', taskId: '${r.taskId}', type: '${r.type}', description: '${r.description}', createdByUserId: '${r.createdByUserId}', createdAt: '${r.createdAt}' }`
  )
  .join(',\n');

const out = `import type { TaskActivity } from '../types/tasks';

/** Historical task activity for the mock dataset. */
export const taskActivities: TaskActivity[] = [
${body}
];
`;

fs.writeFileSync(new URL('../src/data/taskActivity.ts', import.meta.url), out);
console.log('Wrote', rows.length, 'activities');
