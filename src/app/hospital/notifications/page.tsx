"use client";

import { useState, useEffect } from "react";
import { Bell, Check, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageError, PageEmpty } from "@/components/dashboard/page-states";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch("/api/v1/notifications");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setNotifications(data.notifications ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      await fetch(`/api/v1/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
    } catch {
      // Revert if failed
      fetchNotifications();
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await fetch("/api/v1/notifications/mark-all-read", { method: "POST" });
      toast.success("All notifications marked as read");
    } catch {
      fetchNotifications();
      toast.error("Failed to update notifications");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle2 className="size-5 text-emerald-500" />;
      case "warning": return <AlertCircle className="size-5 text-amber-500" />;
      case "error": return <AlertCircle className="size-5 text-destructive" />;
      case "info":
      default:
        return <Info className="size-5 text-blue-500" />;
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-[800px]">
        <PageError onRetry={fetchNotifications} />
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="mx-auto max-w-[800px] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold font-[family-name:var(--font-geist)] text-foreground flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 relative">
              <Bell className="size-4 text-primary" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-3 items-center justify-center rounded-full bg-destructive border-2 border-background" />
              )}
            </div>
            Notifications
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1.5 ml-10">
            View updates, alerts, and system messages
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="rounded-xl">
            <Check className="mr-2 size-4" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-border glass-panel shadow-elevated overflow-hidden">
        {loading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-5 flex gap-4">
                <div className="size-10 rounded-full bg-muted/50 animate-shimmer shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 bg-muted/50 rounded animate-shimmer" />
                  <div className="h-3 w-2/3 bg-muted/50 rounded animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12">
            <PageEmpty
              icon={Bell}
              title="All caught up!"
              description="You have no notifications at the moment."
            />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`flex gap-4 p-5 transition-colors border-b border-border last:border-0 hover:bg-[#111111] ${
                  notification.isRead ? "bg-transparent" : "bg-[#1A1A1A]"
                }`}
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-[#050505] border border-border shadow-sm shrink-0">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className={`text-sm font-semibold ${notification.isRead ? "text-foreground" : "text-foreground"}`}>
                        {notification.title}
                      </h4>
                      <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">
                        {notification.message}
                      </p>
                    </div>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="mt-3 text-[12px] font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
