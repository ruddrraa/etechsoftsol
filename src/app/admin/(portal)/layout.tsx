import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getSession } from "@/lib/auth/jwt";

export default async function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // If no session or not a super admin, redirect to admin login
  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/admin/login");
  }

  return (
    <AppShell 
      variant="admin"
      userName="System Admin"
      userRole={session.role}
      tenantName="Excel Technologies"
    >
      {children}
    </AppShell>
  );
}
