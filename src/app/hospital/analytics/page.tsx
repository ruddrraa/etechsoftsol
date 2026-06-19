"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { RevenueChart, RevenueChartSkeleton } from "@/components/dashboard/revenue-chart";
import { PatientTrendChart, PatientTrendChartSkeleton } from "@/components/dashboard/patient-trend-chart";
import { DepartmentChart, DepartmentChartSkeleton } from "@/components/dashboard/department-chart";
import { AdmissionDischargeChart, AdmissionDischargeChartSkeleton } from "@/components/dashboard/admission-discharge-chart";
import { PageError } from "@/components/dashboard/page-states";

interface ChartData {
  revenue: Array<{ name: string; revenue: number }>;
  patients: Array<{ name: string; patients: number }>;
  departments: Array<{ name: string; patients: number; revenue: number }>;
  admissionsDischarges: Array<{ name: string; admissions: number; discharges: number }>;
}

export default function AnalyticsPage() {
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchCharts = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch("/api/v1/dashboard/charts");
      if (!res.ok) throw new Error("Failed to fetch charts");
      const data = await res.json();
      setCharts(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCharts();
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-[1200px]">
        <PageError onRetry={fetchCharts} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold font-[family-name:var(--font-geist)] text-foreground flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="size-4 text-primary" />
            </div>
            Advanced Analytics
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1.5 ml-10">
            Deep dive into your hospital&apos;s financial and patient metrics
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {loading ? (
          <>
            <RevenueChartSkeleton />
            <PatientTrendChartSkeleton />
            <DepartmentChartSkeleton />
            <AdmissionDischargeChartSkeleton />
          </>
        ) : charts ? (
          <>
            <div className="col-span-1 lg:col-span-2">
              <RevenueChart data={charts.revenue} />
            </div>
            <PatientTrendChart data={charts.patients} />
            <AdmissionDischargeChart data={charts.admissionsDischarges} />
            <div className="col-span-1 lg:col-span-2">
              <DepartmentChart data={charts.departments} />
            </div>
          </>
        ) : (
          <div className="col-span-2 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
            <p className="text-sm text-muted-foreground">
              No chart data available. Upload reports to see analytics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
