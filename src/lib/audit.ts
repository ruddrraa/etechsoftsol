import { connectDB } from "@/lib/db/connect";
import { AuditLog } from "@/models/AuditLog";

export type AuditAction =
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "REPORT_UPLOAD"
  | "REPORT_DELETE"
  | "PASSWORD_CHANGE"
  | "USER_CREATION"
  | "USER_DISABLE"
  | "HOSPITAL_CREATION"
  | "HOSPITAL_UPDATE";

interface LogActionParams {
  actorId: string;
  actorRole: string;
  tenantId?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAction({
  actorId,
  actorRole,
  tenantId,
  action,
  resource,
  resourceId,
  metadata = {},
  ipAddress = "",
  userAgent = "",
}: LogActionParams): Promise<void> {
  try {
    await connectDB();
    await AuditLog.create({
      actorId,
      actorRole,
      tenantId: tenantId || undefined,
      action,
      resource,
      resourceId,
      metadata,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    // Audit logging should never break the main flow
    console.error("[AuditLog] Failed to create log:", err);
  }
}
