"use client";
import { useState, useEffect } from "react";
import { Building2, Users, FileSpreadsheet, Activity, ServerCrash } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [metricsData, setMetricsData] = useState<any>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/v1/admin/dashboard");
        if (res.ok) {
          const data = await res.json();
          setMetricsData(data.metrics);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard metrics", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);
  
  const metrics = [
    { label: "Active Hospitals", value: metricsData?.activeHospitals?.toString() || "0", change: 0, icon: Building2 },
    { label: "Total Users", value: metricsData?.totalUsers?.toString() || "0", change: 0, icon: Users },
    { label: "Reports Processed", value: metricsData?.reportsProcessed?.toString() || "0", change: 0, icon: FileSpreadsheet },
    { label: "API Requests (Total)", value: metricsData?.apiRequests?.toString() || "0", icon: Activity },
    { label: "System Errors", value: metricsData?.systemErrors?.toString() || "0", change: 0, icon: ServerCrash, trend: "down" as const },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div>
        <h1 className="text-xl font-semibold font-[family-name:var(--font-geist)] text-foreground">
          Platform Overview
        </h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Monitor global platform health and hospital metrics
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {metrics.map((metric, i) => (
          <KpiCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            icon={metric.icon}
            index={i}
            loading={loading}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* Main Area: We could put an active hospitals map or global revenue chart here */}
        <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-24 text-center">
          <Building2 className="mx-auto size-10 text-muted-foreground/30 mb-4" />
          <h3 className="text-base font-semibold text-foreground mb-1">Global Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Platform-wide charting and active hospital monitoring goes here.
          </p>
        </div>

        {/* Right Sidebar: Global Activity */}
        <div className="space-y-6">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
