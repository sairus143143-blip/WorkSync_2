import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AccessDenied, type AccessDeniedProps } from '../../pages/AccessDenied';
import type { UserRole } from '../../types/users';

interface RoleRouteProps {
  allow: UserRole[];
  children: React.ReactNode;
  /** Optional module-specific wording for the access-denied screen. */
  denied?: AccessDeniedProps;
}

/** Shows the access-denied screen when the signed-in role isn't allowed on this page. */
export function RoleRoute({ allow, children, denied }: RoleRouteProps) {
  const { user } = useAuth();
  if (!user || !allow.includes(user.role)) return <AccessDenied {...denied} />;
  return <>{children}</>;
}
