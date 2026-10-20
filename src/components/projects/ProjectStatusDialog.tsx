import React, { useEffect, useRef, useState } from 'react';
import type { Project, ProjectStatus } from '../../types/projects';
import { PROJECT_STATUSES, projectStatusLabels } from '../../utils/projects';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { ProjectStatusBadge } from './ProjectBadges';

interface ProjectStatusDialogProps {
  project: Project | null;
  onClose: () => void;
  onConfirm: (project: Project, status: ProjectStatus) => void;
}

const confirmCopy: Record<ProjectStatus, string> = {
  planning: 'Move this project back to planning?',
  active: 'Mark this project as active?',
  on_hold: 'Put this project on hold?',
  completed: 'Mark this project as completed? Progress will be set to 100%.',
  cancelled: 'Cancel this project? It stays visible for historical records.'
};

/** Pick a new status and confirm it in one step. */
export function ProjectStatusDialog({ project: openProject, onClose, onConfirm }: ProjectStatusDialogProps) {
  const last = useRef<Project | null>(openProject);
  if (openProject) last.current = openProject;
  const project = openProject ?? last.current;
  const [status, setStatus] = useState<ProjectStatus>('active');

  useEffect(() => {
    if (openProject) setStatus(openProject.status);
  }, [openProject]);

  const unchanged = project?.status === status;

  return (
    <Modal
      open={openProject !== null}
      onClose={onClose}
      title="Change project status?"
      description={project ? `Project: ${project.name}` : undefined}
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
          variant={status === 'cancelled' ? 'danger' : 'primary'}
          disabled={unchanged}
          onClick={() => openProject && onConfirm(openProject, status)}>
          
            Confirm
          </Button>
        </>
      }>
      
      {project &&
      <div className="space-y-4">
          <div className="flex items-center gap-2 text-[13px] text-muted">
            Current status <ProjectStatusBadge status={project.status} />
          </div>
          <Select
          label="New status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ProjectStatus)}
          options={PROJECT_STATUSES.map((s) => ({ value: s, label: projectStatusLabels[s] }))} />
        
          <p className="text-sm text-ink" aria-live="polite">
            {unchanged ? 'Choose a different status to continue.' : confirmCopy[status]}
          </p>
        </div>
      }
    </Modal>);

}