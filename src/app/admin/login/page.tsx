import { AdminLoginForm } from "@/components/auth/admin-login-form";

export const metadata = {
  title: "Super Admin Login",
  description: "InsightHMS Platform Administration",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — Admin brand */}
      <div className="hidden lg:flex lg:w-[55%] login-pattern relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="flex h-full flex-col justify-center p-12 lg:p-16 text-white">
          <p className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">
            Excel Technologies & Services
          </p>
          <h2 className="text-3xl lg:text-4xl font-semibold font-[family-name:var(--font-geist)] leading-tight">
            Platform
            <br />
            Administration
          </h2>
          <p className="mt-4 text-base text-white/60 max-w-md leading-relaxed">
            Manage hospitals, monitor uploads, configure tenants, and oversee platform health across the entire network.
          </p>
        </div>
      </div>

      {/* Right panel — Admin login form */}
      <div className="flex flex-1 items-center justify-center bg-[#F6F7F9] px-6 py-12">
        <AdminLoginForm />
      </div>
    </div>
  );
}
