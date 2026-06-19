import { HospitalLoginForm, LoginFeatures } from "@/components/auth/hospital-login-form";

export const metadata = {
  title: "Hospital Login",
  description: "Sign in to InsightHMS Hospital Analytics Platform",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — Brand section */}
      <div className="hidden lg:flex lg:w-[55%] login-pattern relative overflow-hidden">
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <LoginFeatures />
      </div>

      {/* Right panel — Login form */}
      <div className="flex flex-1 items-center justify-center bg-[#F6F7F9] px-6 py-12">
        <HospitalLoginForm />
      </div>
    </div>
  );
}
