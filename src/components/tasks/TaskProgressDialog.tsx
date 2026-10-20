import React, { useEffect, useRef, useState } from 'react';
import type { Task } from '../../types/tasks';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { ProgressBar } from '../ui/ProgressBar';

interface TaskProgressDialogProps {
  task: Task | null;
  onClose: () => void;
  onConfirm: (task: Task, progress: number) => void;
}

export function TaskProgressDialog({ task: openTask, onClose, onConfirm }: TaskProgressDialogProps) {
  const last = useRef<Task | null>(openTask);
  if (openTask) last.current = openTask;
  const task = openTask ?? last.current;
  const [progress, setProgress] = useState('0');

  useEffect(() => {
    if (openTask) setProgress(String(openTask.progress));
  }, [openTask]);

  const value = Math.min(100, Math.max(0, Number(progress) || 0));
  const invalid = progress === '' || Number.isNaN(Number(progress)) || value < 0 || value > 100;

  return (
    <Modal
      open={openTask !== null}
      onClose={onClose}
      title="Update Progress"
      description={task ? `Task progress · ${task.title}` : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={invalid || task?.progress === value} onClick={() => openTask && onConfirm(openTask, value)}>Save Progress</Button>
        </>
      }>
      
      {task &&
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-[13px] text-muted">Task Progress</span>
              <span className="text-xl font-semibold tabular-nums">{value}%</span>
            </div>
            <ProgressBar value={value} size="md" label="Task progress preview" />
          </div>
          <Input label="Progress (%)" type="number" min={0} max={100} value={progress} onChange={(e) => setProgress(e.target.value)} />
          {value === 100 && <p className="text-sm text-muted">Progress at 100% will mark the task as completed.</p>}
        </div>
      }
    </Modal>
  );
}
