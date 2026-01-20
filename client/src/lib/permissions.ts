import type { UserRole } from '@/contexts/auth';

export interface PermissionSet {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canDownload: boolean;
  canView: boolean;
}

export function getPermissions(role: UserRole): PermissionSet {
  // Training Manager has read-only access
  if (role === 'TRAINING_MANAGER') {
    return {
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canDownload: true,  // Can download reports
      canView: true,       // Can view everything
    };
  }

  // Other roles have full permissions (existing behavior)
  return {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canDownload: true,
    canView: true,
  };
}

export function canAccessRoute(role: UserRole, route: string): boolean {
  // Training Manager cannot access creation/editing routes
  if (role === 'TRAINING_MANAGER') {
    const restrictedRoutes = [
      '/create-request',
      '/create-visit',
      '/create-activity',
      '/create-collaborative-form',
      '/create-query',
      '/edit-school',
      '/edit-school-data',
    ];

    return !restrictedRoutes.some(restricted => route.startsWith(restricted));
  }

  return true;
}
