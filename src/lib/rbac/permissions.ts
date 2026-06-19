import { PERMISSIONS, type PermissionKey, type UserRole } from "@/types";

const ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  SUPER_ADMIN: Object.values(PERMISSIONS),
  HOSPITAL_ADMIN: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.UPLOAD_REPORTS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_SNAPSHOTS,
    PERMISSIONS.MANAGE_HOSPITAL_SETTINGS,
    PERMISSIONS.VIEW_AI_INSIGHTS,
  ],
  HOSPITAL_USER: [
    PERMISSIONS.UPLOAD_REPORTS,
    PERMISSIONS.VIEW_ANALYTICS_LIMITED,
    PERMISSIONS.VIEW_REPORTS,
  ],
};

export function hasPermission(role: UserRole, permission: PermissionKey): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canAccessAdminPortal(role: UserRole): boolean {
  return role === "SUPER_ADMIN";
}

export function canAccessHospitalPortal(role: UserRole): boolean {
  return role === "HOSPITAL_ADMIN" || role === "HOSPITAL_USER";
}

export function canManageUsers(role: UserRole): boolean {
  return hasPermission(role, PERMISSIONS.MANAGE_USERS);
}

export function canViewFullAnalytics(role: UserRole): boolean {
  return hasPermission(role, PERMISSIONS.VIEW_ANALYTICS);
}

export { ROLE_PERMISSIONS };
