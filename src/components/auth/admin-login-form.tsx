"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Shield, Loader2, Eye, EyeOff, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function AdminLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/v1/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Login failed");
        return;
      }

      toast.success("Welcome back, Admin!");
      router.push("/admin/dashboard");
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
        <div className="flex items-center gap-2 mb-2">
          <Shield className="size-5 text-muted-foreground" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Platform Administration
          </span>
        </div>
        <h1 className="text-2xl font-semibold font-[family-name:var(--font-geist)] text-foreground">
          Super Admin Login
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Access the Excel Technologies platform administration panel.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="admin@exceltechnologies.com"
            className="h-10 rounded-xl bg-white border-input hover:border-ring/50 transition-colors"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </Label>
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
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
          Sign in to Admin
        </Button>
      </form>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        <Link href="/" className="text-primary hover:underline font-medium">
          ← Back to home
        </Link>
      </p>
    </motion.div>
  );
}
