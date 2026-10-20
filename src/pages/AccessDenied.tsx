import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlertIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';

export interface AccessDeniedProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
}

export function AccessDenied({
  title = "You don't have access to this page",
  description = 'This area is available to the WorkSync system administrator only.',
  actionLabel = 'Back to dashboard',
  actionTo = '/dashboard'
}: AccessDeniedProps) {
  const navigate = useNavigate();
  return (
    <Card>
      <EmptyState
        icon={ShieldAlertIcon}
        title={title}
        description={description}
        action={<Button onClick={() => navigate(actionTo)}>{actionLabel}</Button>}
        className="py-16" />
      
    </Card>);

}