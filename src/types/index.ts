export type UserRole = "SUPER_ADMIN" | "HOSPITAL_ADMIN" | "HOSPITAL_USER";

export type TenantStatus = "active" | "suspended" | "pending";

export type UserStatus = "active" | "disabled" | "pending_setup";

export type UploadStatus =
  | "pending"
  | "validating"
  | "validated"
  | "importing"
  | "completed"
  | "failed";

export interface JwtPayload {
  sub: string;
  role: UserRole;
  tenantId?: string;
  tenantName?: string;
  impersonating?: {
    tenantId: string;
    adminId: string;
  };
  iat?: number;
  exp?: number;
}

export interface SessionUser {
  id: string;
  userId: string;
  name: string;
  role: UserRole;
  tenantId?: string;
  tenantName?: string;
  isImpersonating?: boolean;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export type DateRangePreset =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "this_month"
  | "custom";

export interface KpiMetric {
  label: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  trend?: "up" | "down" | "neutral";
  format?: "number" | "currency" | "percent";
}

export interface Permission {
  id: string;
  description: string;
}

export const PERMISSIONS = {
  MANAGE_HOSPITALS: "manage_hospitals",
  VIEW_PLATFORM_ANALYTICS: "view_platform_analytics",
  VIEW_AUDIT_LOGS: "view_audit_logs",
  IMPERSONATE_HOSPITAL: "impersonate_hospital",
  MANAGE_USERS: "manage_users",
  UPLOAD_REPORTS: "upload_reports",
  VIEW_ANALYTICS: "view_analytics",
  VIEW_ANALYTICS_LIMITED: "view_analytics_limited",
  EXPORT_REPORTS: "export_reports",
  VIEW_REPORTS: "view_reports",
  MANAGE_SNAPSHOTS: "manage_snapshots",
  MANAGE_HOSPITAL_SETTINGS: "manage_hospital_settings",
  VIEW_AI_INSIGHTS: "view_ai_insights",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
