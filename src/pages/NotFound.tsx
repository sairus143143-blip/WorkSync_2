import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';

export function NotFound() {
  const navigate = useNavigate();
  return (
    <Card>
      <EmptyState
        icon={CompassIcon}
        title="Page not found"
        description="The page you're looking for doesn't exist or has moved."
        action={<Button onClick={() => navigate('/dashboard')}>Back to dashboard</Button>}
        className="py-16" />
      
    </Card>);

}