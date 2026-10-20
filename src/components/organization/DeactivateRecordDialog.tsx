import React, { useRef } from 'react';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export interface DeactivateRequest {
  id: string;
  name: string;
  /** Shown as a warning when the record still has employees or positions. */
  warning?: string;
}

interface DeactivateRecordDialogProps {
  /** e.g. "department" or "position" */
  noun: string;
  request: DeactivateRequest | null;
  onClose: () => void;
  onConfirm: (request: DeactivateRequest) => void;
}

/** Shared confirmation for deactivating departments and positions. Nothing is deleted. */
export function DeactivateRecordDialog({ noun, request: openRequest, onClose, onConfirm }: DeactivateRecordDialogProps) {
  const last = useRef<DeactivateRequest | null>(openRequest);
  if (openRequest) last.current = openRequest;
  const request = openRequest ?? last.current;

  return (
    <Modal
      open={openRequest !== null}
      onClose={onClose}
      title={`Deactivate ${noun}`}
      description={request ? `Are you sure you want to deactivate ${request.name}?` : undefined}
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => openRequest && onConfirm(openRequest)}>
            Deactivate
          </Button>
        </>
      }>
      
      <div className="space-y-3">
        {request?.warning &&
        <Alert tone="warning" title="Records are still linked">
            {request.warning}
          </Alert>
        }
        <p className="text-[13px] text-muted">
          The {noun} stays visible and existing employee records are kept unchanged. You can reactivate it at any time.
        </p>
      </div>
    </Modal>);

}