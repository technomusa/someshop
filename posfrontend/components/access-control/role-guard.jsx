'use client';

import { useSession } from 'next-auth/react';
import { canAccess } from '@/lib/access-control';

/**
 * Role Guard Component
 * 
 * Conditionally renders children based on user's access permissions
 * 
 * @example
 * <RoleGuard module="inventory" action="manage">
 *   <InventoryManagement />
 * </RoleGuard>
 */
export function RoleGuard({ children, module, action = 'view', fallback = null, user: propUser = null }) {
  const { data: session } = useSession();
  const user = propUser || session?.user;

  if (!user) {
    return fallback || <div>Please log in</div>;
  }

  const hasAccess = canAccess(module, user, action);

  if (!hasAccess) {
    return fallback || <div>You don't have permission to access this content</div>;
  }

  return <>{children}</>;
}

/**
 * Route Guard Component
 * 
 * Redirects or shows fallback if user cannot access route
 */
export function RouteGuard({ children, path, fallback = null }) {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) {
    return fallback || <div>Please log in</div>;
  }

  // Import dynamically to avoid circular dependencies
  const { canAccessRoute } = require('@/lib/access-control');
  const hasAccess = canAccessRoute(path, user);

  if (!hasAccess) {
    return fallback || <div>You don't have permission to access this page</div>;
  }

  return <>{children}</>;
}
