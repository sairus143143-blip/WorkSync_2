import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import type { Employee } from '../../types/employees';
import type { Department } from '../../types/organization';
import type { Project } from '../../types/projects';
import type { TaskDeadlineFilter, TaskPriorityFilter, TaskStatusFilter } from '../../types/tasks';
import { TASK_PRIORITIES, TASK_STATUSES, taskPriorityLabels, taskStatusLabels } from '../../utils/tasks';
import { Button } from '../ui/Button';
import { SearchInput } from '../ui/SearchInput';
import { Select } from '../ui/Select';

interface TaskFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  status: TaskStatusFilter;
  onStatusChange: (value: TaskStatusFilter) => void;
  priority: TaskPriorityFilter;
  onPriorityChange: (value: TaskPriorityFilter) => void;
  projectId: string;
  onProjectChange: (value: string) => void;
  employeeId: string;
  onEmployeeChange: (value: string) => void;
  departmentId: string;
  onDepartmentChange: (value: string) => void;
  deadline: TaskDeadlineFilter;
  onDeadlineChange: (value: TaskDeadlineFilter) => void;
  projects: Project[];
  employees: Employee[];
  departments: Department[];
  hasFilters: boolean;
  onClear: () => void;
  resultCount: number;
}

export function TaskFilters(props: TaskFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  const filterGrid =
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <Select
        hideLabel
        label="Status"
        value={props.status}
        onChange={(e) => props.onStatusChange(e.target.value as TaskStatusFilter)}
        options={[
          { value: 'all', label: 'All' },
          ...TASK_STATUSES.map((s) => ({ value: s, label: taskStatusLabels[s] }))
        ]} />
      
      <Select
        hideLabel
        label="Priority"
        value={props.priority}
        onChange={(e) => props.onPriorityChange(e.target.value as TaskPriorityFilter)}
        options={[
          { value: 'all', label: 'All' },
          ...TASK_PRIORITIES.map((p) => ({ value: p, label: taskPriorityLabels[p] }))
        ]} />
      
      <Select
        hideLabel
        label="Project"
        value={props.projectId}
        onChange={(e) => props.onProjectChange(e.target.value)}
        options={[{ value: 'all', label: 'All Projects' }, ...props.projects.map((p) => ({ value: p.id, label: p.name }))]} />
      
      <Select
        hideLabel
        label="Assigned employee"
        value={props.employeeId}
        onChange={(e) => props.onEmployeeChange(e.target.value)}
        options={[
          { value: 'all', label: 'All Employees' },
          ...props.employees.map((e) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))
        ]} />
      
      <Select
        hideLabel
        label="Department"
        value={props.departmentId}
        onChange={(e) => props.onDepartmentChange(e.target.value)}
        options={[{ value: 'all', label: 'All Departments' }, ...props.departments.map((d) => ({ value: d.id, label: d.name }))]} />
      
      <Select
        hideLabel
        label="Deadline"
        value={props.deadline}
        onChange={(e) => props.onDeadlineChange(e.target.value as TaskDeadlineFilter)}
        options={[
          { value: 'all', label: 'All' },
          { value: 'overdue', label: 'Overdue' },
          { value: 'due_today', label: 'Due Today' },
          { value: 'due_week', label: 'Due This Week' },
          { value: 'upcoming', label: 'Upcoming' }
        ]} />
      
    </div>;


  return (
    <div className="space-y-3 border-b border-line p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput
          value={props.query}
          onChange={props.onQueryChange}
          label="Search tasks"
          placeholder="Search tasks..."
          className="lg:max-w-md" />
        
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={() => setExpanded((v) => !v)}
          rightIcon={expanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}>
          
          {expanded ? 'Hide filters' : 'Show filters'}
        </Button>
        <div className="hidden lg:block lg:flex-1">{filterGrid}</div>
      </div>
      {expanded && <div className="lg:hidden">{filterGrid}</div>}
      <div className="flex items-center gap-3 text-[13px] text-muted">
        <p aria-live="polite">
          {props.resultCount} {props.resultCount === 1 ? 'task' : 'tasks'}
        </p>
        {props.hasFilters &&
          <Button variant="ghost" size="sm" onClick={props.onClear}>
            Clear Filters
          </Button>
        }
      </div>
    </div>
  );
}
