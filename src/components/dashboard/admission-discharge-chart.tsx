"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart as ChartBar, Calendar } from "lucide-react";

interface AdmissionDischargeChartProps {
  data: Array<{ name: string; admissions: number | null; discharges: number | null }>;
}

export function AdmissionDischargeChart({ data }: AdmissionDischargeChartProps) {
  const chartConfig = {
    admissions: {
      label: "Admissions",
      color: "var(--success)",
    },
    discharges: {
      label: "Discharges",
      color: "var(--text-secondary)",
    },
  };

  const validPoints = data.filter(d => d.admissions !== null || d.discharges !== null).length;

  if (validPoints < 2) {
    return (
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-card flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="size-12 rounded-full bg-surface-secondary flex items-center justify-center mb-4">
          <ChartBar className="size-6 text-text-secondary opacity-50" />
        </div>
        <h3 className="text-sm font-semibold text-text-primary mb-2">Insufficient Data</h3>
        <p className="text-[13px] text-text-secondary max-w-[250px] leading-relaxed">
          More report uploads are required before comparative trend analysis becomes available.
        </p>
      </div>
    );
  }

  const validData = data.filter(d => d.admissions !== null) as Array<{name: string, admissions: number, discharges: number}>;
  const currentAdmissions = validData[validData.length - 1]?.admissions || 0;
  const currentDischarges = validData[validData.length - 1]?.discharges || 0;

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-card transition-all hover:shadow-dropdown">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-text-primary">Admit Snap</h3>
          <p className="text-[13px] text-text-secondary mt-1">Last 7 Days</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface-secondary text-[12px] font-medium text-text-secondary">
          <Calendar className="size-3.5" />
          <span>Last 7 Days</span>
        </div>
      </div>
      <div className="h-[260px] w-full">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.15} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
              dy={10}
              tickFormatter={(val) => {
                const date = new Date(val);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
              dx={-10}
            />
            <ChartTooltip
              cursor={{ fill: 'var(--surface-secondary)' }}
              content={<ChartTooltipContent />}
            />
            <ChartLegend content={<ChartLegendContent />} verticalAlign="top" align="right" />
            <Bar
              dataKey="admissions"
              fill="var(--color-admissions)"
              radius={[8, 8, 0, 0]}
              barSize={16}
            />
            <Bar
              dataKey="discharges"
              fill="var(--color-discharges)"
              radius={[8, 8, 0, 0]}
              barSize={16}
            />
          </BarChart>
        </ChartContainer>
      </div>

      <div className="mt-6 pt-5 border-t border-border flex items-center gap-6">
        <div>
          <p className="text-[12px] text-text-secondary uppercase tracking-wider font-semibold mb-1">Latest Admissions</p>
          <p className="text-xl font-bold text-text-primary">{currentAdmissions.toLocaleString("en-IN")}</p>
        </div>
        <div>
          <p className="text-[12px] text-text-secondary uppercase tracking-wider font-semibold mb-1">Latest Discharges</p>
          <p className="text-xl font-bold text-text-primary">{currentDischarges.toLocaleString("en-IN")}</p>
        </div>
      </div>
    </div>
  );
}

export function AdmissionDischargeChartSkeleton() {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-card">
      <div className="h-3 w-44 rounded-md animate-shimmer mb-8" />
      <div className="h-[280px] rounded-lg animate-shimmer" />
    </div>
  );
}
