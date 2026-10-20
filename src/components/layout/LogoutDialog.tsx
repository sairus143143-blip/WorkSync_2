import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface LogoutDialogProps {
  open: boolean;
  onClose: () => void;
}

export function LogoutDialog({ open, onClose }: LogoutDialogProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const confirm = () => {
    onClose();
    logout();
    navigate('/login', { replace: true });
    toast({ tone: 'info', title: 'You have been logged out' });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log out of WorkSync?"
      description="You'll need to sign in again to access the admin console."
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirm}>
            Log out
          </Button>
        </>
      } />);


}