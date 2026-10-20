import React, { useEffect, useRef, useState } from 'react';
import type { Task, TaskStatus } from '../../types/tasks';
import { TASK_STATUSES, taskStatusLabels } from '../../utils/tasks';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { TaskStatusBadge } from './TaskBadges';

interface TaskStatusDialogProps {
  task: Task | null;
  onClose: () => void;
  onConfirm: (task: Task, status: TaskStatus) => void;
}

export function TaskStatusDialog({ task: openTask, onClose, onConfirm }: TaskStatusDialogProps) {
  const last = useRef<Task | null>(openTask);
  if (openTask) last.current = openTask;
  const task = openTask ?? last.current;
  const [status, setStatus] = useState<TaskStatus>('todo');

  useEffect(() => {
    if (openTask) setStatus(openTask.status);
  }, [openTask]);

  const unchanged = task?.status === status;

  return (
    <Modal
      open={openTask !== null}
      onClose={onClose}
      title="Change Status"
      description={task ? task.title : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={unchanged} onClick={() => openTask && onConfirm(openTask, status)}>Update Status</Button>
        </>
      }>
      
      {task &&
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[13px] text-muted">
            Current <TaskStatusBadge status={task.status} />
          </div>
          <Select
            label="New status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            options={TASK_STATUSES.map((s) => ({ value: s, label: taskStatusLabels[s] }))} />
          
        </div>
      }
    </Modal>
  );
}
