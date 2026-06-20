"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Users, UserPlus, UserMinus, Building2, BarChart2, PieChart as PieChartIcon } from "lucide-react";
import { KpiCard, KpiCardSkeleton } from "@/components/dashboard/kpi-card";
import { PageError } from "@/components/dashboard/page-states";
import { DataTable } from "@/components/dashboard/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const COLORS = ['var(--primary)', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function HospitalDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch("/api/v1/dashboard/dynamic");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
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

  const handleExportCsv = () => {
    if (!data?.rawData || data.rawData.length === 0) return;
    const headers = Object.keys(data.rawData[0]).join(",");
    const rows = data.rawData.map((row: any) => 
      Object.values(row).map(val => `"${val}"`).join(",")
    );
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "dashboard_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tableColumns = useMemo<ColumnDef<any>[]>(() => {
    if (!data?.schema) return [];
    return data.schema.map((field: any) => ({
      accessorKey: field.name,
      header: field.name.replace(/_/g, " "),
      cell: ({ row }: any) => {
        const val = row.getValue(field.name);
        return <span>{val !== null && val !== undefined ? String(val) : "-"}</span>;
      }
    }));
  }, [data?.schema]);

  if (error) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-6">
        <PageError title="Failed to load dashboard" message="Could not retrieve dynamic dashboard data." onRetry={fetchDashboard} />
      </div>
    );
  }

  if (!loading && (!data?.schema || data.schema.length === 0)) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-6">
        <div>
          <h1 className="text-xl font-semibold font-[family-name:var(--font-geist)] text-foreground">Dashboard</h1>
        </div>
        <div className="rounded-[var(--radius-card)] border border-dashed border-border bg-surface px-6 py-16 text-center">
          <p className="text-sm text-text-secondary mb-4">No data available. Upload a report to generate your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 pb-10">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold font-[family-name:var(--font-geist)] text-foreground">
          Dynamic Dashboard
        </h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Generated automatically from your uploaded reports
        </p>
      </div>

      {/* KPI metrics row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
        ) : (
          data?.kpis?.map((kpi: any, i: number) => {
            const icons = [Users, UserPlus, UserMinus, Building2, BarChart2];
            const Icon = icons[i % icons.length];
            return (
              <KpiCard
                key={kpi.label}
                label={kpi.label}
                value={kpi.value?.toLocaleString("en-IN") || "0"}
                icon={Icon}
                index={i}
              />
            );
          })
        )}
      </div>

      {/* Charts Area */}
      {!loading && data?.charts && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Chart 1: Date-wise Trend Chart */}
          {data.charts.trend && data.charts.trend.length > 0 && (
            <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-card col-span-2">
              <h3 className="text-lg font-bold text-text-primary mb-6">Date-wise Trend</h3>
              <div className="h-[300px] w-full">
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
                    <Area type="monotone" dataKey="maleCount" name="Male" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.1} strokeWidth={2} />
                    <Area type="monotone" dataKey="femaleCount" name="Female" stroke={COLORS[5]} fill={COLORS[5]} fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 2: Department Distribution */}
          {data.charts.departmentDistribution && data.charts.departmentDistribution.length > 0 && (
            <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-card">
              <h3 className="text-lg font-bold text-text-primary mb-6">Department Distribution</h3>
              <div className="h-[300px] w-full">
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
              <h3 className="text-lg font-bold text-text-primary mb-2">Gender Distribution</h3>
              <div className="flex-1 min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.charts.maleVsFemale}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
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
      )}

      {/* Raw Data Table */}
      {!loading && data?.rawData && (
        <div className="space-y-4 pt-6">
          <h2 className="text-lg font-bold text-text-primary">Raw Data (Latest)</h2>
          <DataTable
            columns={tableColumns}
            data={data.rawData}
            searchPlaceholder="Search raw data..."
            onExportCsv={handleExportCsv}
          />
        </div>
      )}
    </div>
  );
}
