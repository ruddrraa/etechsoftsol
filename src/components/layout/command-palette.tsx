"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  BarChart3,
  Upload,
  FileSpreadsheet,
  Users,
  Settings,
  Bell,
  Building2,
  Search,
  Plus,
  Shield,
  Activity,
} from "lucide-react";

interface CommandPaletteProps {
  variant: "admin" | "hospital";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ variant, open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

  // Ctrl+K / Cmd+K keyboard shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  const runCommand = useCallback(
    (command: () => void) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange]
  );

  const hospitalActions = [
    {
      group: "Navigation",
      items: [
        { icon: LayoutDashboard, label: "Open Dashboard", action: () => router.push("/hospital/dashboard") },
        { icon: BarChart3, label: "Open Analytics", action: () => router.push("/hospital/analytics") },
        { icon: Upload, label: "Upload Report", action: () => router.push("/hospital/upload") },
        { icon: FileSpreadsheet, label: "View Reports", action: () => router.push("/hospital/reports") },
        { icon: Bell, label: "Notifications", action: () => router.push("/hospital/notifications") },
        { icon: Users, label: "Manage Users", action: () => router.push("/hospital/users") },
        { icon: Settings, label: "Settings", action: () => router.push("/hospital/settings") },
      ],
    },
    {
      group: "Quick Actions",
      items: [
        { icon: Upload, label: "Upload a new report", action: () => router.push("/hospital/upload") },
        { icon: Plus, label: "Create a new user", action: () => router.push("/hospital/users") },
      ],
    },
  ];

  const adminActions = [
    {
      group: "Navigation",
      items: [
        { icon: LayoutDashboard, label: "Admin Dashboard", action: () => router.push("/admin/dashboard") },
        { icon: Building2, label: "Manage Hospitals", action: () => router.push("/admin/hospitals") },
        { icon: Users, label: "Manage Clients", action: () => router.push("/admin/clients") },
        { icon: Activity, label: "Activity Log", action: () => router.push("/admin/activity") },
        { icon: Shield, label: "Audit Logs", action: () => router.push("/admin/audit-logs") },
        { icon: Settings, label: "Admin Settings", action: () => router.push("/admin/settings") },
      ],
    },
    {
      group: "Quick Actions",
      items: [
        { icon: Plus, label: "Create a hospital", action: () => router.push("/admin/hospitals") },
        { icon: Search, label: "Search hospitals", action: () => router.push("/admin/hospitals") },
      ],
    },
  ];

  const actions = variant === "admin" ? adminActions : hospitalActions;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {actions.map((group, i) => (
          <div key={group.group}>
            {i > 0 && <CommandSeparator />}
            <CommandGroup heading={group.group}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.label}
                  onSelect={() => runCommand(item.action)}
                  className="gap-3 py-3"
                >
                  <item.icon className="size-4 text-muted-foreground" />
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
