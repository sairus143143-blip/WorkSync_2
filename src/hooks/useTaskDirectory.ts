import { useMemo, useState } from 'react';
import type { TaskDeadlineFilter, TaskPriorityFilter, TaskRow, TaskSort, TaskSortKey, TaskStatusFilter } from '../types/tasks';
import { compareTaskRows, matchesDeadlineFilter, taskSearchText } from '../utils/tasks';

interface Options {
  rows: TaskRow[];
}

/** Search, filters, and sorting for task list view. */
export function useTaskDirectory({ rows }: Options) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<TaskStatusFilter>('all');
  const [priority, setPriority] = useState<TaskPriorityFilter>('all');
  const [projectId, setProjectId] = useState('all');
  const [employeeId, setEmployeeId] = useState('all');
  const [deadline, setDeadline] = useState<TaskDeadlineFilter>('all');
  const [sort, setSort] = useState<TaskSort>({ key: 'dueDate', direction: 'asc' });

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      if (status !== 'all' && row.task.status !== status) return false;
      if (priority !== 'all' && row.task.priority !== priority) return false;
      if (projectId !== 'all' && row.task.projectId !== projectId) return false;
      if (employeeId !== 'all' && row.task.assignedEmployeeId !== employeeId) return false;
      if (!matchesDeadlineFilter(row, deadline)) return false;
      if (q && !taskSearchText(row).toLowerCase().includes(q)) return false;
      return true;
    });
    const factor = sort.direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => compareTaskRows(a, b, sort.key) * factor);
  }, [rows, query, status, priority, projectId, employeeId, deadline, sort]);

  const toggleSort = (key: string) => {
    const nextKey = key as TaskSortKey;
    setSort((current) =>
      current.key === nextKey ?
        { key: nextKey, direction: current.direction === 'asc' ? 'desc' : 'asc' } :
        { key: nextKey, direction: nextKey === 'dueDate' || nextKey === 'progress' ? 'desc' : 'asc' }
    );
  };

  const hasFilters =
    query.trim() !== '' ||
    status !== 'all' ||
    priority !== 'all' ||
    projectId !== 'all' ||
    employeeId !== 'all' ||
    deadline !== 'all';

  const clearFilters = () => {
    setQuery('');
    setStatus('all');
    setPriority('all');
    setProjectId('all');
    setEmployeeId('all');
    setDeadline('all');
  };

  return {
    query,
    setQuery,
    status,
    setStatus,
    priority,
    setPriority,
    projectId,
    setProjectId,
    employeeId,
    setEmployeeId,
    deadline,
    setDeadline,
    sort,
    toggleSort,
    visible,
    hasFilters,
    clearFilters
  };
}
