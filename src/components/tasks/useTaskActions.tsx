import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '../../contexts/EmployeesContext';
import { useProjects } from '../../contexts/ProjectsContext';
import { useTasks } from '../../contexts/TasksContext';
import { useToast } from '../../contexts/ToastContext';
import type { Task, TaskFormValues, TaskStatus } from '../../types/tasks';
import type { TaskRow } from '../../types/tasks';
import { TaskFormModal } from './TaskFormModal';
import { TaskProgressDialog } from './TaskProgressDialog';
import { TaskReassignDialog } from './TaskReassignDialog';
import { TaskStatusDialog } from './TaskStatusDialog';
import type { TaskCardActions } from './TaskCard';

type FormState = { mode: 'create' } | { mode: 'edit'; taskId: string } | null;

export function useTaskActions() {
  const navigate = useNavigate();
  const { tasks, activities, createTask, updateTask, setTaskStatus, setTaskProgress, reassignTask } = useTasks();
  const { projects, members } = useProjects();
  const { employees } = useEmployees();
  const { toast } = useToast();

  const [form, setForm] = useState<FormState>(null);
  const [statusTaskId, setStatusTaskId] = useState<string | null>(null);
  const [progressTaskId, setProgressTaskId] = useState<string | null>(null);
  const [reassignTaskId, setReassignTaskId] = useState<string | null>(null);

  const editing = form?.mode === 'edit' ? tasks.find((t) => t.id === form.taskId) : undefined;
  const statusTask = statusTaskId ? tasks.find((t) => t.id === statusTaskId) ?? null : null;
  const progressTask = progressTaskId ? tasks.find((t) => t.id === progressTaskId) ?? null : null;
  const reassignTaskRecord = reassignTaskId ? tasks.find((t) => t.id === reassignTaskId) ?? null : null;

  const openCreate = () => setForm({ mode: 'create' });
  const openEdit = (row: TaskRow | Task) => {
    const task = 'task' in row ? row.task : row;
    setForm({ mode: 'edit', taskId: task.id });
  };
  const openView = (row: TaskRow) => navigate(`/tasks/${row.task.id}`);
  const openStatus = (row: TaskRow) => setStatusTaskId(row.task.id);
  const openProgress = (row: TaskRow) => setProgressTaskId(row.task.id);
  const openReassign = (row: TaskRow) => setReassignTaskId(row.task.id);

  const submitForm = (values: TaskFormValues) => {
    if (editing) {
      updateTask(editing.id, values);
      toast({ title: 'Task updated successfully.' });
    } else {
      createTask(values);
      toast({ title: 'Task created successfully.' });
    }
    setForm(null);
  };

  const confirmStatus = (task: Task, status: TaskStatus) => {
    setTaskStatus(task.id, status);
    setStatusTaskId(null);
    toast({ title: 'Task status updated.' });
  };

  const confirmProgress = (task: Task, progress: number) => {
    setTaskProgress(task.id, progress);
    setProgressTaskId(null);
    toast({ title: 'Task progress updated successfully.' });
  };

  const confirmReassign = (task: Task, employeeId: string) => {
    reassignTask(task.id, employeeId);
    setReassignTaskId(null);
    toast({ title: 'Task reassigned successfully.' });
  };

  const moveToStatus = (row: TaskRow, status: TaskStatus) => {
    if (row.task.status === status) return;
    setTaskStatus(row.task.id, status);
    toast({ title: 'Task status updated.' });
  };

  const tableActions: TaskCardActions = {
    onView: openView,
    onEdit: openEdit,
    onChangeStatus: openStatus,
    onUpdateProgress: openProgress,
    onReassign: openReassign,
    onMoveTo: moveToStatus
  };

  const dialogs =
    <>
      <TaskFormModal
        open={form !== null}
        task={editing}
        tasks={tasks}
        projects={projects}
        members={members}
        employees={employees}
        onClose={() => setForm(null)}
        onSubmit={submitForm}
        onInvalid={(message) => toast({ tone: 'error', title: message })} />
      
      <TaskStatusDialog task={statusTask} onClose={() => setStatusTaskId(null)} onConfirm={confirmStatus} />
      <TaskProgressDialog task={progressTask} onClose={() => setProgressTaskId(null)} onConfirm={confirmProgress} />
      <TaskReassignDialog
        task={reassignTaskRecord}
        members={members}
        employees={employees}
        onClose={() => setReassignTaskId(null)}
        onConfirm={confirmReassign} />
      
    </>;


  return { openCreate, openEdit, openView, tableActions, dialogs, tasks, activities };
}
