import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/** Signed-in admins skip the login screens and go straight to the dashboard. */
export function PublicOnlyRoute({ children }: {children: React.ReactNode;}) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}