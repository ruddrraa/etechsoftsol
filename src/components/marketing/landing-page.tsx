"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  Building2,
  FileSpreadsheet,
  Shield,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Zap,
    title: "Instant Analytics",
    description: "Upload Excel or CSV reports and see insights in seconds, not days.",
  },
  {
    icon: Building2,
    title: "Multi-Hospital Ready",
    description: "Isolated, secure tenant architecture for 150+ hospitals and growing.",
  },
  {
    icon: FileSpreadsheet,
    title: "Executive Snapshots",
    description: "Generate PDF reports and share via email or WhatsApp instantly.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Role-based access, audit logs, and complete data isolation.",
  },
  {
    icon: Upload,
    title: "Premium Upload Center",
    description: "Drag-and-drop imports with validation, duplicate detection, and history.",
  },
  {
    icon: Sparkles,
    title: "AI Insights",
    description: "Coming soon — automated trend detection and intelligent alerts.",
  },
];

const metrics = [
  { value: "150+", label: "Hospitals" },
  { value: "1M+", label: "Records Processed" },
  { value: "99.9%", label: "Uptime" },
  { value: "<30s", label: "Import Time" },
];

const steps = [
  { step: "01", title: "Export from HMS", description: "Generate your daily summary report in Excel or CSV." },
  { step: "02", title: "Upload to Portal", description: "Drag and drop into the secure analytics portal." },
  { step: "03", title: "Access Dashboards", description: "Instant KPIs, charts, and exportable reports." },
];

export function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed inset-x-0 top-0 z-50 glass">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <BarChart3 className="size-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">InsightHMS</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Hospital Login
            </Link>
            <Link href="/login" className={cn(buttonVariants({ size: "sm" }))}>
              Get Started
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="gradient-hero grid-pattern relative overflow-hidden pt-32 pb-24 text-white">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm backdrop-blur-sm">
              Built for 150+ hospitals across India
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Hospital analytics,{" "}
              <span className="bg-gradient-to-r from-teal-300 to-blue-400 bg-clip-text text-transparent">
                finally beautiful
              </span>
            </h1>
            <p className="mt-6 text-lg text-white/70">
              Transform daily Excel reports into real-time dashboards. A premium analytics
              layer for hospitals powered by Excel Technologies And Services.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/login"
                className={cn(buttonVariants({ size: "lg" }), "h-12 px-8")}
              >
                Hospital Login
                <ArrowRight className="ml-2 size-4" />
              </Link>
              <a
                href="mailto:excel.rks@gmail.com"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "h-12 border-white/20 bg-white/5 px-8 text-white hover:bg-white/10 hover:text-white"
                )}
              >
                Request Demo
              </a>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative mx-auto mt-16 max-w-4xl"
          >
            <div className="rounded-xl border border-white/10 bg-white/5 p-1 shadow-elevated backdrop-blur-sm">
              <div className="rounded-lg bg-background p-6">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {[
                    { label: "Patients", value: "2,847", change: "+12%" },
                    { label: "Admissions", value: "412", change: "+8%" },
                    { label: "Discharges", value: "389", change: "-3%" },
                    { label: "Revenue", value: "₹18.4L", change: "+18%" },
                    { label: "Pending", value: "₹2.1L", change: "-5%" },
                    { label: "Critical", value: "23", change: "+2" },
                  ].map((kpi) => (
                    <div key={kpi.label} className="rounded-lg border bg-card p-3">
                      <p className="text-xs text-muted-foreground">{kpi.label}</p>
                      <p className="mt-1 font-mono text-lg font-semibold">{kpi.value}</p>
                      <p className="text-xs text-primary">{kpi.change}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <div className="h-32 rounded-lg border bg-muted/30" />
                  <div className="h-32 rounded-lg border bg-muted/30" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-b bg-muted/30 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center lg:px-6">
          <p className="text-sm text-muted-foreground">
            Trusted by 150+ hospitals across West Bengal and beyond
          </p>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-16">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-4 lg:grid-cols-4 lg:px-6">
          {metrics.map((m) => (
            <div key={m.label} className="text-center">
              <p className="font-mono text-3xl font-bold text-primary">{m.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Everything your hospital needs to go data-driven
            </h2>
            <p className="mt-4 text-muted-foreground">
              A modern SaaS experience — not another legacy ERP interface.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border bg-card p-6 shadow-soft"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="size-5 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">How it works</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <span className="font-mono text-4xl font-bold text-primary/30">{s.step}</span>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-hero py-24 text-white">
        <div className="mx-auto max-w-2xl px-4 text-center lg:px-6">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to modernize your hospital analytics?
          </h2>
          <p className="mt-4 text-white/70">
            Join 150+ hospitals already using InsightHMS by Excel Technologies.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "h-12 px-8")}>
              Hospital Login
            </Link>
            <a
              href="mailto:excel.rks@gmail.com"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-12 border-white/20 bg-white/5 px-8 text-white hover:bg-white/10 hover:text-white"
              )}
            >
              Contact Excel Technologies
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row lg:px-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" />
            <span className="text-sm font-medium">InsightHMS by Excel Technologies</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Excel Technologies And Services. All rights reserved.
          </p>
          <Link href="/admin/login" className="text-xs text-muted-foreground hover:text-primary">
            Admin
          </Link>
        </div>
      </footer>
    </div>
  );
}
