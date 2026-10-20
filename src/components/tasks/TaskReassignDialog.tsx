import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Employee } from '../../types/employees';
import type { ProjectMember } from '../../types/projects';
import type { Task } from '../../types/tasks';
import { activeMemberEmployeeIds } from '../../utils/tasks';
import { employeeFullName } from '../../utils/employees';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';

interface TaskReassignDialogProps {
  task: Task | null;
  members: ProjectMember[];
  employees: Employee[];
  onClose: () => void;
  onConfirm: (task: Task, employeeId: string) => void;
}

export function TaskReassignDialog({ task: openTask, members, employees, onClose, onConfirm }: TaskReassignDialogProps) {
  const last = useRef<Task | null>(openTask);
  if (openTask) last.current = openTask;
  const task = openTask ?? last.current;
  const [employeeId, setEmployeeId] = useState('');

  const options = useMemo(() => {
    if (!task) return [];
    const ids = activeMemberEmployeeIds(members, task.projectId).filter((id) => id !== task.assignedEmployeeId);
    return employees.filter((e) => ids.includes(e.id));
  }, [task, members, employees]);

  useEffect(() => {
    if (openTask) setEmployeeId('');
  }, [openTask]);

  return (
    <Modal
      open={openTask !== null}
      onClose={onClose}
      title="Reassign Task"
      description="Reassign this task to another project member?"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={!employeeId} onClick={() => openTask && employeeId && onConfirm(openTask, employeeId)}>Confirm Reassign</Button>
        </>
      }>
      
      {task &&
        <Select
          label="Project member"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          options={[
            { value: '', label: 'Select employee' },
            ...options.map((e) => ({ value: e.id, label: `${employeeFullName(e)} · ${e.employeeNumber}` }))
          ]} />
        
      }
    </Modal>
  );
}
