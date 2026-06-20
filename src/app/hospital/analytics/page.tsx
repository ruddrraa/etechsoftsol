"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { PageError } from "@/components/dashboard/page-states";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from "recharts";

const COLORS = ['var(--primary)', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch("/api/v1/dashboard/dynamic");
      if (!res.ok) throw new Error("Failed to fetch analytics data");
      const json = await res.json();
      setData(json);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (error) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-6">
        <PageError title="Failed to load analytics" message="Could not retrieve dynamic analytics data." onRetry={fetchDashboard} />
      </div>
    );
  }

  if (!loading && (!data?.schema || data.schema.length === 0)) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-6">
        <div>
          <h1 className="text-xl font-semibold font-[family-name:var(--font-geist)] text-foreground flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="size-4 text-primary" />
            </div>
            Advanced Analytics
          </h1>
        </div>
        <div className="rounded-[var(--radius-card)] border border-dashed border-border bg-surface px-6 py-16 text-center">
          <p className="text-sm text-text-secondary mb-4">No analytics data available. Upload a report to generate charts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold font-[family-name:var(--font-geist)] text-foreground flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="size-4 text-primary" />
            </div>
            Advanced Analytics
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1.5 ml-10">
            Deep dive into your hospital&apos;s dynamic metrics based on uploaded reports.
          </p>
        </div>
      </div>

      {!loading && data?.charts && (
        <div className="grid gap-6">
          {/* Chart 1: Date-wise Trend Chart (Full Width) */}
          {data.charts.trend && data.charts.trend.length > 0 && (
            <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-card">
              <h3 className="text-lg font-bold text-text-primary mb-6">Date-wise Metric Trends</h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.charts.trend.length === 1 ? [
                    { date: new Date(new Date(data.charts.trend[0].date).setDate(new Date(data.charts.trend[0].date).getDate() - 1)).toISOString().split('T')[0], totalCount: 0, maleCount: 0, femaleCount: 0 },
                    data.charts.trend[0]
                  ] : data.charts.trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--text-secondary)" }} dy={10} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--text-secondary)" }} dx={-10} />
                    <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--surface)" }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }} />
                    <Area type="monotone" dataKey="totalCount" name="Total Count" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.2} strokeWidth={2} />
                    <Area type="monotone" dataKey="maleCount" name="Male Count" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.1} strokeWidth={2} />
                    <Area type="monotone" dataKey="femaleCount" name="Female Count" stroke={COLORS[5]} fill={COLORS[5]} fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Chart 2: Department Distribution */}
            {data.charts.departmentDistribution && data.charts.departmentDistribution.length > 0 && (
              <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-card">
                <h3 className="text-lg font-bold text-text-primary mb-6">Distribution by Department</h3>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.charts.departmentDistribution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--text-secondary)" }} dy={10} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--text-secondary)" }} dx={-10} />
                      <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--surface)" }} cursor={{ fill: "var(--surface-secondary)" }} />
                      <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                        {data.charts.departmentDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Chart 3: Male vs Female */}
            {data.charts.maleVsFemale && data.charts.maleVsFemale.length > 0 && (
              <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-card flex flex-col">
                <h3 className="text-lg font-bold text-text-primary mb-2">Gender Demographics</h3>
                <div className="flex-1 min-h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.charts.maleVsFemale}
                        cx="50%"
                        cy="50%"
                        innerRadius={90}
                        outerRadius={130}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell fill={COLORS[0]} />
                        <Cell fill={COLORS[5]} />
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--surface)" }} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
