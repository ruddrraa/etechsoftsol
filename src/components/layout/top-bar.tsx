"use client";

import { useState, useEffect } from "react";
import { Bell, Search, Menu, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "./sidebar-context";
import { useRouter } from "next/navigation";

interface TopBarProps {
  userName?: string;
  userRole?: string;
  tenantName?: string;
  clientCode?: string;
  variant?: "admin" | "hospital";
  onCommandPaletteOpen?: () => void;
}

export function TopBar({
  userName,
  userRole,
  tenantName,
  clientCode,
  variant = "hospital",
  onCommandPaletteOpen,
}: TopBarProps) {
  const router = useRouter();
  const { setMobileOpen } = useSidebar();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    async function fetchNotificationCount() {
      try {
        const res = await fetch("/api/v1/notifications?unreadOnly=true&limit=1");
        if (res.ok) {
          const data = await res.json();
          setNotificationCount(data.unreadCount ?? 0);
        }
      } catch {
        // Silently fail — notification count is non-critical
      }
    }
    fetchNotificationCount();
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      window.location.href = variant === "admin" ? "/admin/login" : "/login";
    } catch {
      window.location.href = "/login";
    }
  }

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface px-4 lg:px-6">
      {/* Left side: Mobile menu + Welcome */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden size-9"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>

        <div className="hidden sm:block">
          <h1 className="text-base font-semibold font-[family-name:var(--font-geist)] text-foreground">
            Welcome, {variant === "hospital" ? (tenantName ?? userName ?? "User") : (userName ?? "Admin")}!
          </h1>
          <p className="text-[13px] text-muted-foreground">
            {variant === "hospital" && clientCode ? `Client Code: ${clientCode}` : "Manage your analytics with real-time insights"}
          </p>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Search / Command palette trigger */}
        <button
          onClick={onCommandPaletteOpen}
          className="hidden sm:flex items-center gap-2 rounded-xl border border-input bg-surface-secondary px-3 py-1.5 text-sm text-text-secondary hover:bg-border transition-colors cursor-pointer"
        >
          <Search className="size-3.5" />
          <span className="text-[13px]">Search...</span>
          <kbd className="ml-4 hidden md:inline-flex items-center gap-0.5 rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-text-secondary shadow-sm">
            ⌘K
          </kbd>
        </button>

        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden size-9"
          onClick={onCommandPaletteOpen}
          aria-label="Search"
        >
          <Search className="size-4" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9"
          aria-label="Notifications"
          onClick={() => router.push(variant === "admin" ? "/admin/activity" : "/hospital/notifications")}
        >
          <Bell className="size-4" />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-surface-secondary transition-colors outline-none cursor-pointer">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="hidden sm:block size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2">
              <p className="text-sm font-medium">{userName ?? "User"}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {userRole?.toLowerCase().replace(/_/g, " ") ?? "User"}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(variant === "admin" ? "/admin/settings" : "/hospital/settings")}>
              <User className="mr-2 size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(variant === "admin" ? "/admin/settings" : "/hospital/settings")}>
              <Settings className="mr-2 size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
