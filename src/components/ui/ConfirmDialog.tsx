import React, { useRef } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel: string;
  tone?: 'primary' | 'danger';
  /** Optional extra content, e.g. a summary of what changes. */
  details?: React.ReactNode;
}

interface ConfirmDialogProps {
  request: ConfirmRequest | null;
  onClose: () => void;
  onConfirm: () => void;
}

/** Generic confirmation. Keeps showing the last request while the exit animation runs. */
export function ConfirmDialog({ request: openRequest, onClose, onConfirm }: ConfirmDialogProps) {
  const last = useRef<ConfirmRequest | null>(openRequest);
  if (openRequest) last.current = openRequest;
  const request = openRequest ?? last.current;

  return (
    <Modal
      open={openRequest !== null}
      onClose={onClose}
      title={request?.title ?? ''}
      description={request?.message}
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={request?.tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
            {request?.confirmLabel ?? 'Confirm'}
          </Button>
        </>
      }>
      
      {request?.details}
    </Modal>);

}