import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useTasks } from '../../contexts/TasksContext';
import type { TaskStatusCount } from '../../types/dashboard';
import { chartColors } from '../../utils/chartColors';
import { summarizeTasks } from '../../utils/tasks';
import { Card } from '../ui/Card';

const barColor: Record<TaskStatusCount['id'], string> = {
  todo: chartColors.neutral,
  progress: chartColors.info,
  completed: chartColors.success,
  blocked: chartColors.warning,
  overdue: chartColors.danger
};

export function TaskOverview({ className }: {className?: string;}) {
  const { tasks } = useTasks();
  const summary = summarizeTasks(tasks);
  const taskStatusCounts: TaskStatusCount[] = [
    { id: 'todo', label: 'To Do', count: summary.todo },
    { id: 'progress', label: 'In Progress', count: summary.in_progress + summary.in_review },
    { id: 'completed', label: 'Completed', count: summary.completed },
    { id: 'blocked', label: 'Blocked', count: summary.blocked },
    { id: 'overdue', label: 'Overdue', count: summary.overdue }
  ];
  const total = tasks.length;

  return (
    <Card
      title="Task overview"
      description={`${total} tasks across active projects`}
      className={className}
      action={
      <Link
        to="/tasks"
        className="inline-flex items-center gap-1 rounded text-[13px] font-medium text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
        
          Tasks <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
        </Link>
      }>
      
      <figure>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={taskStatusCounts} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 0 }} barCategoryGap={8}>
              <XAxis type="number" hide domain={[0, 'dataMax']} />
              <YAxis
                type="category"
                dataKey="label"
                width={84}
                axisLine={false}
                tickLine={false}
                tick={{ fill: chartColors.muted, fontSize: 12 }} />
              
              <Bar dataKey="count" radius={[0, 4, 4, 0]} animationDuration={300}>
                {taskStatusCounts.map((t) =>
                <Cell key={t.id} fill={barColor[t.id]} />
                )}
                <LabelList dataKey="count" position="right" style={{ fill: '#14181F', fontSize: 12, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <figcaption className="sr-only">{taskStatusCounts.map((t) => `${t.label}: ${t.count}`).join(', ')}</figcaption>
      </figure>
      <p className="mt-3 border-t border-line pt-3 text-xs text-muted">
        Overdue tasks are counted within To Do, In Progress and Blocked.
      </p>
    </Card>);

}
