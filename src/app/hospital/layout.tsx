import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getSession } from "@/lib/auth/jwt";
import { Tenant } from "@/models/Tenant";
import { connectDB } from "@/lib/db/connect";

export default async function HospitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // If no session or wrong role, redirect to login
  if (!session || session.role === "SUPER_ADMIN") {
    redirect("/login");
  }

  // Get tenant details for the UI
  await connectDB();
  const tenant = await Tenant.findById(session.tenantId).lean();
  
  if (!tenant || tenant.status !== "active") {
    redirect("/login");
  }

  return (
    <AppShell 
      variant="hospital"
      userName={session.id} 
      userRole={session.role}
      tenantName={tenant.name}
      clientCode={tenant.clientCode}
    >
      {children}
    </AppShell>
  );
}
