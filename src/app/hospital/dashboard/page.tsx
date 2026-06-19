"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, UserPlus, UserMinus, IndianRupee, Receipt } from "lucide-react";
import { KpiCard, KpiCardSkeleton } from "@/components/dashboard/kpi-card";
import { RevenueChart, RevenueChartSkeleton } from "@/components/dashboard/revenue-chart";
import { PatientTrendChart, PatientTrendChartSkeleton } from "@/components/dashboard/patient-trend-chart";
import { DepartmentChart, DepartmentChartSkeleton } from "@/components/dashboard/department-chart";
import { AdmissionDischargeChart, AdmissionDischargeChartSkeleton } from "@/components/dashboard/admission-discharge-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { PageError } from "@/components/dashboard/page-states";

interface KpiMetric {
  label: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "neutral";
}

interface ChartData {
  revenue: Array<{ name: string; revenue: number }>;
  patients: Array<{ name: string; patients: number }>;
  departments: Array<{ name: string; patients: number; revenue: number }>;
  admissionsDischarges: Array<{ name: string; admissions: number; discharges: number }>;
}

export default function HospitalDashboardPage() {
  const [metrics, setMetrics] = useState<KpiMetric[]>([]);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState(false);
  const [chartsError, setChartsError] = useState(false);

  const fetchMetrics = useCallback(async () => {
    try {
      setMetricsLoading(true);
      setMetricsError(false);
      const res = await fetch("/api/v1/dashboard/metrics");
      if (!res.ok) throw new Error("Failed to fetch metrics");
      const data = await res.json();
      setMetrics(data.metrics ?? []);
    } catch {
      setMetricsError(true);
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  const fetchCharts = useCallback(async () => {
    try {
      setChartsLoading(true);
      setChartsError(false);
      const res = await fetch("/api/v1/dashboard/charts");
      if (!res.ok) throw new Error("Failed to fetch charts");
      const data = await res.json();
      setCharts(data);
    } catch {
      setChartsError(true);
    } finally {
      setChartsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMetrics();
    fetchCharts();
  }, [fetchMetrics, fetchCharts]);

  const kpiIcons = [Users, UserPlus, UserMinus, IndianRupee, Receipt];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold font-[family-name:var(--font-geist)] text-foreground">
          Dashboard
        </h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Overview of your hospital analytics
        </p>
      </div>

      {/* KPI metrics row */}
      {metricsError ? (
        <PageError
          title="Failed to load metrics"
          message="Could not retrieve dashboard metrics from the server."
          onRetry={fetchMetrics}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {metricsLoading ? (
            Array.from({ length: 5 }).map((_, i) => <KpiCardSkeleton key={i} />)
          ) : metrics.length === 0 ? (
            <div className="col-span-full rounded-[var(--radius-card)] border border-dashed border-border bg-surface px-6 py-12 text-center">
              <p className="text-sm text-text-secondary">
                No metrics available. Upload reports to see dashboard data.
              </p>
            </div>
          ) : (
            metrics.map((metric, i) => (
              <KpiCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                change={metric.change}
                trend={metric.trend}
                icon={kpiIcons[i]}
                index={i}
              />
            ))
          )}
        </div>
      )}

      {/* Charts grid + Activity sidebar */}
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* Main charts area */}
        <div className="space-y-6">
          {chartsError ? (
            <PageError
              title="Failed to load charts"
              message="Could not retrieve analytics data."
              onRetry={fetchCharts}
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {chartsLoading ? (
                <>
                  <RevenueChartSkeleton />
                  <PatientTrendChartSkeleton />
                  <DepartmentChartSkeleton />
                  <AdmissionDischargeChartSkeleton />
                </>
              ) : charts ? (
                <>
                  <RevenueChart data={charts.revenue} />
                  <PatientTrendChart data={charts.patients} />
                  <DepartmentChart data={charts.departments} />
                  <AdmissionDischargeChart data={charts.admissionsDischarges} />
                </>
              ) : (
                <div className="col-span-2 rounded-[var(--radius-card)] border border-dashed border-border bg-surface px-6 py-16 text-center">
                  <p className="text-sm text-text-secondary">
                    No chart data available. Upload reports to see analytics.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar: Activity */}
        <div className="space-y-6">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
