import React, { useRef } from 'react';
import type { EmployeeView, EmploymentStatus } from '../../types/employees';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export interface StatusChangeRequest {
  view: EmployeeView;
  next: Extract<EmploymentStatus, 'inactive' | 'on_leave'>;
}

interface EmploymentStatusDialogProps {
  request: StatusChangeRequest | null;
  onClose: () => void;
  onConfirm: (request: StatusChangeRequest) => void;
}

const copy = {
  inactive: {
    title: 'Deactivate employee',
    body: (name: string) =>
    `Are you sure you want to deactivate ${name}? Their employment record is kept, and their WorkSync account will also be deactivated.`,
    action: 'Deactivate',
    variant: 'danger' as const
  },
  on_leave: {
    title: 'Set employee on leave',
    body: (name: string) => `Mark ${name} as On Leave? Their WorkSync account stays active while they're away.`,
    action: 'Set On Leave',
    variant: 'primary' as const
  }
};

export function EmploymentStatusDialog({ request: openRequest, onClose, onConfirm }: EmploymentStatusDialogProps) {
  const lastRequest = useRef<StatusChangeRequest | null>(openRequest);
  if (openRequest) lastRequest.current = openRequest;
  const request = openRequest ?? lastRequest.current;
  const text = request ? copy[request.next] : copy.inactive;

  return (
    <Modal
      open={openRequest !== null}
      onClose={onClose}
      title={text.title}
      description={request ? text.body(request.view.fullName) : undefined}
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={text.variant} onClick={() => openRequest && onConfirm(openRequest)}>
            {text.action}
          </Button>
        </>
      } />);


}