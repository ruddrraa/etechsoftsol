"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Building2,
  Users,
  Activity,
  Shield,
  Settings,
  BarChart3,
  Upload,
  FileSpreadsheet,
  Camera,
  Bell,
  Sparkles,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/* ─── Navigation definitions ─── */

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const adminNavGroups: NavGroup[] = [
  {
    title: "MAIN MENU",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/hospitals", label: "Hospitals", icon: Building2 },
      { href: "/admin/activity", label: "Activity", icon: Activity },
    ],
  },
  {
    title: "OTHERS",
    items: [
      { href: "/admin/audit-logs", label: "Audit Logs", icon: Shield },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

const hospitalNavGroups: NavGroup[] = [
  {
    title: "MAIN MENU",
    items: [
      { href: "/hospital/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/hospital/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/hospital/upload", label: "Upload", icon: Upload },
      { href: "/hospital/reports", label: "Reports", icon: FileSpreadsheet },
    ],
  },
  {
    title: "OTHERS",
    items: [
      { href: "/hospital/snapshots", label: "Snapshots", icon: Camera, adminOnly: true },
      { href: "/hospital/users", label: "Users", icon: Users, adminOnly: true },
      { href: "/hospital/notifications", label: "Notifications", icon: Bell },
      { href: "/hospital/ai-insights", label: "AI Insights", icon: Sparkles, adminOnly: true },
      { href: "/hospital/settings", label: "Settings", icon: Settings, adminOnly: true },
    ],
  },
];

/* ─── NavLink component ─── */

function NavLink({
  item,
  isActive,
  collapsed,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}) {
  const content = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
        collapsed && "justify-center px-0",
        isActive
          ? "bg-sidebar-accent text-primary"
          : "text-sidebar-foreground hover:bg-surface-secondary hover:text-text-primary"
      )}
    >
      <item.icon className={cn("size-[18px] shrink-0", isActive && "text-primary")} />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger className="w-full">
          {content}
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

/* ─── Main sidebar ─── */

interface AppSidebarProps {
  variant: "admin" | "hospital";
  hospitalName?: string;
  isAdmin?: boolean;
  userName?: string;
  userRole?: string;
}

export function AppSidebar({
  variant,
  hospitalName,
  isAdmin = true,
  userName,
  userRole,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed } = useSidebar();

  const navGroups =
    variant === "admin"
      ? adminNavGroups
      : hospitalNavGroups.map((group) => ({
          ...group,
          items: group.items.filter((item) => !item.adminOnly || isAdmin),
        }));

  async function handleLogout() {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      window.location.href = variant === "admin" ? "/admin/login" : "/login";
    } catch {
      window.location.href = "/login";
    }
  }

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out shrink-0",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo section */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-sidebar-border shrink-0",
          collapsed ? "justify-center px-2" : "px-5"
        )}
      >
        <Link href={variant === "admin" ? "/admin/dashboard" : "/hospital/dashboard"} className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary shrink-0">
            <BarChart3 className="size-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-w-0"
            >
              <p className="text-sm font-semibold font-[family-name:var(--font-geist)] truncate">
                {variant === "admin" ? "InsightHMS" : (hospitalName ?? "Hospital Portal")}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {variant === "admin" ? "Platform Admin" : "Analytics Portal"}
              </p>
            </motion.div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-4">
            {!collapsed && (
              <p className="px-5 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.title}
              </p>
            )}
            <div className={cn("space-y-0.5", collapsed ? "px-2" : "px-3")}>
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <NavLink
                    key={item.href}
                    item={item}
                    isActive={isActive}
                    collapsed={collapsed}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section: User + Collapse */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        {/* User profile */}
        {(userName || userRole) && (
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5",
              collapsed && "justify-center px-0"
            )}
          >
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{userName ?? "User"}</p>
                <p className="text-[11px] text-muted-foreground truncate capitalize">
                  {userRole?.toLowerCase().replace(/_/g, " ") ?? "User"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-sidebar-foreground hover:bg-surface-secondary hover:text-danger transition-all duration-200 w-full",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="size-[18px] shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={toggleCollapsed}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-sidebar-foreground hover:bg-surface-secondary hover:text-text-primary transition-all duration-200 w-full",
            collapsed && "justify-center px-0"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronsRight className="size-[18px]" />
          ) : (
            <>
              <ChevronsLeft className="size-[18px]" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

/* ─── Mobile sidebar ─── */

export function MobileSidebar({
  variant,
  hospitalName,
  isAdmin = true,
  userName,
  userRole,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { mobileOpen, setMobileOpen } = useSidebar();

  const navGroups =
    variant === "admin"
      ? adminNavGroups
      : hospitalNavGroups.map((group) => ({
          ...group,
          items: group.items.filter((item) => !item.adminOnly || isAdmin),
        }));

  async function handleLogout() {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      window.location.href = variant === "admin" ? "/admin/login" : "/login";
    } catch {
      window.location.href = "/login";
    }
  }

  return (
    <AnimatePresence>
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col bg-sidebar border-r border-sidebar-border shadow-modal"
          >
            {/* Logo */}
            <div className="flex h-16 items-center px-5 border-b border-sidebar-border">
              <Link
                href={variant === "admin" ? "/admin/dashboard" : "/hospital/dashboard"}
                className="flex items-center gap-2.5"
                onClick={() => setMobileOpen(false)}
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                  <BarChart3 className="size-4 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold font-[family-name:var(--font-geist)] truncate">
                    {variant === "admin" ? "InsightHMS" : (hospitalName ?? "Hospital Portal")}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {variant === "admin" ? "Platform Admin" : "Analytics Portal"}
                  </p>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto scrollbar-thin py-4">
              {navGroups.map((group) => (
                <div key={group.title} className="mb-4">
                  <p className="px-5 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {group.title}
                  </p>
                  <div className="space-y-0.5 px-3">
                    {group.items.map((item) => {
                      const isActive =
                        pathname === item.href || pathname.startsWith(`${item.href}/`);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                            isActive
                              ? "bg-sidebar-accent text-primary"
                              : "text-sidebar-foreground hover:bg-surface-secondary hover:text-text-primary"
                          )}
                        >
                          <item.icon
                            className={cn("size-[18px] shrink-0", isActive && "text-primary")}
                          />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Bottom */}
            <div className="border-t border-sidebar-border p-3 space-y-2">
              {(userName || userRole) && (
                <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
                    {userName ? userName.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{userName ?? "User"}</p>
                    <p className="text-[11px] text-muted-foreground truncate capitalize">
                      {userRole?.toLowerCase().replace(/_/g, " ") ?? "User"}
                    </p>
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-sidebar-foreground hover:bg-surface-secondary hover:text-danger transition-all duration-200 w-full"
              >
                <LogOut className="size-[18px] shrink-0" />
                <span>Sign out</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export { adminNavGroups, hospitalNavGroups };
