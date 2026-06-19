"use client";

import { useEffect, useState } from "react";
import { Activity, Upload, UserPlus, LogIn, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  _id: string;
  action: string;
  resource: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

const actionIcons: Record<string, typeof Activity> = {
  USER_LOGIN: LogIn,
  REPORT_UPLOAD: Upload,
  USER_CREATION: UserPlus,
  REPORT_DELETE: AlertTriangle,
};

function getActionIcon(action: string) {
  return actionIcons[action] ?? Activity;
}

function getActionLabel(action: string, resource: string) {
  const labels: Record<string, string> = {
    USER_LOGIN: "User logged in",
    USER_LOGOUT: "User logged out",
    REPORT_UPLOAD: "Report uploaded",
    REPORT_DELETE: "Report deleted",
    USER_CREATION: "New user created",
    USER_DISABLE: "User disabled",
    PASSWORD_CHANGE: "Password changed",
    HOSPITAL_CREATION: "Hospital created",
    HOSPITAL_UPDATE: "Hospital updated",
  };
  return labels[action] ?? `${action} on ${resource}`;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchActivity() {
      try {
        setLoading(true);
        setError(false);
        const res = await fetch("/api/v1/audit-logs?limit=8");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setActivities(data.logs ?? []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchActivity();
  }, []);

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-card">
      <h3 className="text-[11px] font-bold tracking-widest text-text-secondary uppercase mb-6">
        Recent Activity
      </h3>

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="size-8 rounded-lg animate-shimmer shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 rounded animate-shimmer" />
                <div className="h-2 w-16 rounded animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="text-[13px] text-muted-foreground py-8 text-center">
          Unable to load activity
        </p>
      )}

      {!loading && !error && activities.length === 0 && (
        <div className="flex flex-col items-center py-10 text-center">
          <Activity className="size-8 text-muted-foreground/30" />
          <p className="mt-4 text-[13px] text-muted-foreground">No recent activity</p>
        </div>
      )}

      {!loading && !error && activities.length > 0 && (
        <div className="space-y-2">
          {activities.map((item) => {
            const Icon = getActionIcon(item.action);
            return (
              <div
                key={item._id}
                className="flex items-start gap-4 rounded-xl px-3 py-3 hover:bg-surface-secondary border border-transparent hover:border-border transition-all cursor-pointer group"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-surface-secondary border border-border shrink-0 group-hover:bg-surface shadow-sm transition-colors">
                  <Icon className="size-4 text-primary group-hover:text-primary-hover transition-colors" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-[13px] font-medium text-text-primary truncate transition-colors">
                    {getActionLabel(item.action, item.resource)}
                  </p>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
