"use client";

import { useState } from "react";
import { AppSidebar, MobileSidebar } from "./app-sidebar";
import { TopBar } from "./top-bar";
import { CommandPalette } from "./command-palette";
import { SidebarProvider } from "./sidebar-context";

interface AppShellProps {
  children: React.ReactNode;
  variant?: "admin" | "hospital";
  hospitalName?: string;
  isAdmin?: boolean;
  userName?: string;
  userRole?: string;
  tenantName?: string;
  clientCode?: string;
}

export function AppShell({
  children,
  variant = "hospital",
  hospitalName,
  isAdmin,
  userName,
  userRole,
  tenantName,
  clientCode,
}: AppShellProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        {/* Desktop sidebar */}
        <AppSidebar
          variant={variant}
          hospitalName={hospitalName}
          isAdmin={isAdmin}
          userName={userName}
          userRole={userRole}
        />

        {/* Mobile sidebar */}
        <MobileSidebar
          variant={variant}
          hospitalName={hospitalName}
          isAdmin={isAdmin}
          userName={userName}
          userRole={userRole}
        />

        {/* Main content area */}
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar
            userName={userName}
            userRole={userRole}
            tenantName={tenantName}
            clientCode={clientCode}
            variant={variant}
            onCommandPaletteOpen={() => setCommandPaletteOpen(true)}
          />
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>

      {/* Command palette */}
      <CommandPalette
        variant={variant}
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
    </SidebarProvider>
  );
}
