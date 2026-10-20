import React, { useRef } from 'react';
import type { SystemUser } from '../../types/users';
import { displayName } from '../../utils/users';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface DeactivateUserDialogProps {
  user: SystemUser | null;
  onClose: () => void;
  onConfirm: (user: SystemUser) => void;
}

export function DeactivateUserDialog({ user: openUser, onClose, onConfirm }: DeactivateUserDialogProps) {
  const lastUser = useRef<SystemUser | null>(openUser);
  if (openUser) lastUser.current = openUser;
  const user = openUser ?? lastUser.current;

  return (
    <Modal
      open={openUser !== null}
      onClose={onClose}
      title="Deactivate employee account"
      description={
      user ?
      `Are you sure you want to deactivate ${displayName(user)}? They won't be able to sign in until the account is activated again.` :
      undefined
      }
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => openUser && onConfirm(openUser)}>
            Deactivate
          </Button>
        </>
      } />);


}