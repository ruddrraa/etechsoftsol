"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Building2, Loader2, Eye, EyeOff, BarChart3, Shield, Activity, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface HospitalOption {
  _id: string;
  name: string;
  clientCode: string;
}

export function HospitalLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hospitals, setHospitals] = useState<HospitalOption[]>([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(true);
  const [hospitalsError, setHospitalsError] = useState(false);

  useEffect(() => {
    async function fetchHospitals() {
      try {
        setHospitalsLoading(true);
        setHospitalsError(false);
        const res = await fetch("/api/v1/tenants/public-list");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setHospitals(data.tenants ?? []);
      } catch {
        setHospitalsError(true);
        setHospitals([]);
      } finally {
        setHospitalsLoading(false);
      }
    }
    fetchHospitals();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const hospitalId = formData.get("hospital") as string;
    const role = formData.get("role") as string;
    const userId = formData.get("userId") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospitalId, role, userId, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Login failed");
        return;
      }

      toast.success("Welcome back!");
      router.push("/hospital/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full max-w-[420px]"
    >
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary">
            <BarChart3 className="size-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold font-[family-name:var(--font-geist)]">InsightHMS</span>
        </div>
        <h1 className="text-2xl font-semibold font-[family-name:var(--font-geist)] text-foreground">
          Sign in to your account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Select your hospital and enter your credentials to access analytics.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="hospital" className="text-sm font-medium text-foreground">
            Hospital
          </Label>
          {hospitalsLoading ? (
            <div className="flex h-10 items-center rounded-xl border border-input bg-white px-3">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading hospitals...</span>
            </div>
          ) : hospitalsError ? (
            <div className="flex h-10 items-center rounded-xl border border-destructive/30 bg-destructive/5 px-3">
              <span className="text-sm text-destructive">Failed to load hospitals</span>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="ml-auto text-xs text-primary hover:underline"
              >
                Retry
              </button>
            </div>
          ) : hospitals.length === 0 ? (
            <div className="flex h-10 items-center rounded-xl border border-input bg-white px-3">
              <span className="text-sm text-muted-foreground">No hospitals available</span>
            </div>
          ) : (
            <Select name="hospital" required>
              <SelectTrigger
                id="hospital"
                className="w-full h-10 rounded-xl bg-white border-input hover:border-ring/50 transition-colors"
              >
                <SelectValue placeholder="Select your hospital" />
              </SelectTrigger>
              <SelectContent>
                {hospitals.map((h) => (
                  <SelectItem key={h._id} value={h._id}>
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-medium text-foreground">
            Login As
          </Label>
          <Select name="role" required defaultValue="HOSPITAL_ADMIN">
            <SelectTrigger
              id="role"
              className="w-full h-10 rounded-xl bg-white border-input hover:border-ring/50 transition-colors"
            >
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HOSPITAL_ADMIN">Hospital Admin</SelectItem>
              <SelectItem value="HOSPITAL_USER">Hospital User</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="userId" className="text-sm font-medium text-foreground">
            User ID
          </Label>
          <Input
            id="userId"
            name="userId"
            placeholder="Enter your user ID"
            className="h-10 rounded-xl bg-white border-input hover:border-ring/50 transition-colors"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="h-10 rounded-xl bg-white border-input hover:border-ring/50 transition-colors pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-10 rounded-xl font-medium text-sm"
          disabled={loading || hospitalsLoading}
        >
          {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
          Sign in
        </Button>
      </form>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Need access? Contact your hospital administrator or{" "}
        <a href="mailto:excel.rks@gmail.com" className="text-primary hover:underline font-medium">
          Excel Technologies
        </a>
      </p>
    </motion.div>
  );
}

/* Left panel features for the split-screen layout */
export function LoginFeatures() {
  const features = [
    { icon: Building2, label: "150+ Hospitals Connected" },
    { icon: Activity, label: "Real-Time Analytics" },
    { icon: Shield, label: "Secure Reporting" },
    { icon: Users, label: "Role-Based Access" },
  ];

  return (
    <div className="flex h-full flex-col justify-between p-12 lg:p-16 text-white">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
            <BarChart3 className="size-5 text-white" />
          </div>
          <span className="text-lg font-semibold font-[family-name:var(--font-geist)]">InsightHMS</span>
        </div>
      </div>

      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <p className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">
            Excel Technologies & Services
          </p>
          <h2 className="text-3xl lg:text-4xl font-semibold font-[family-name:var(--font-geist)] leading-tight">
            Enterprise Hospital
            <br />
            Analytics Platform
          </h2>
          <p className="mt-4 text-base text-white/60 max-w-md leading-relaxed">
            Transform daily Excel reports into real-time dashboards. A premium analytics layer for hospitals across India.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-10 grid grid-cols-2 gap-4"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3"
            >
              <feature.icon className="size-4 text-white/70 shrink-0" />
              <span className="text-sm text-white/80">{feature.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div>
        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} Excel Technologies And Services. All rights reserved.
        </p>
      </div>
    </div>
  );
}
