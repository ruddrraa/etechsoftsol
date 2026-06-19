import Link from "next/link";
import { ArrowRight, Activity, Building2, ShieldCheck, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-[family-name:var(--font-geist)] selection:bg-primary/10 selection:text-primary">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary shadow-soft">
              <Activity className="size-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              InsightHMS
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/login" className="hidden sm:flex">
              <Button variant="ghost">
                Admin Portal
              </Button>
            </Link>
            <Link href="/login">
              <Button className="rounded-full shadow-soft">
                Hospital Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-40">
          {/* Abstract background blobs */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
            <div className="absolute top-[-10%] right-[10%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[10%] h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
          </div>

          <div className="relative mx-auto max-w-5xl px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary shadow-sm mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="flex size-2 rounded-full bg-primary animate-pulse" />
              InsightHMS Enterprise 2.0 is Live
            </div>
            
            <h1 className="mx-auto max-w-4xl text-balance text-6xl font-bold tracking-tight text-text-primary sm:text-7xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
              Hospital analytics, <br />
              <span className="text-primary">beautifully simplified.</span>
            </h1>
            
            <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-text-secondary animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
              Transform your daily MIS reports into actionable insights. Powerful analytics, real-time tracking, and comprehensive reporting for modern healthcare facilities.
            </p>
            
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500">
              <Link href="/login">
                <Button size="lg" className="rounded-full h-14 px-8 text-base shadow-dropdown group transition-all hover:shadow-lg">
                    Access Dashboard
                    <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-border bg-surface-secondary py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-20 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-5xl">
                Enterprise-grade platform
              </h2>
              <p className="mt-6 text-lg text-text-secondary">
                Everything you need to manage your hospital&apos;s performance at scale.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: BarChart3,
                  title: "Advanced Analytics",
                  description: "Beautiful, real-time charts covering revenue, admissions, and departmental trends."
                },
                {
                  icon: Building2,
                  title: "Multi-tenant Architecture",
                  description: "Secure data isolation for individual hospitals managed under one centralized super admin."
                },
                {
                  icon: ShieldCheck,
                  title: "Audit Logging",
                  description: "Complete traceability for all system actions, user sessions, and report uploads."
                }
              ].map((feature, i) => (
                <div key={i} className="rounded-[var(--radius-card)] border border-border bg-surface p-10 shadow-card transition-all hover:-translate-y-1 hover:shadow-dropdown">
                  <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                    <feature.icon className="size-7 text-primary" />
                  </div>
                  <h3 className="mb-4 text-xl font-bold text-text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <Activity className="size-5 text-muted-foreground" />
            <span className="font-semibold text-muted-foreground">InsightHMS</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Excel Technologies. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
