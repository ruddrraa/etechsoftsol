"use client";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie } from "recharts";
import { PieChart as ChartPie, Calendar } from "lucide-react";

interface DepartmentChartProps {
  data: Array<{ name: string; patients: number; revenue: number }>;
}

export function DepartmentChart({ data }: DepartmentChartProps) {
  if (!data || data.length < 1) {
    return (
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-card flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="size-12 rounded-full bg-surface-secondary flex items-center justify-center mb-4">
          <ChartPie className="size-6 text-text-secondary opacity-50" />
        </div>
        <h3 className="text-sm font-semibold text-text-primary mb-2">Insufficient Data</h3>
        <p className="text-[13px] text-text-secondary max-w-[250px] leading-relaxed">
          More report uploads are required before department analysis becomes available.
        </p>
      </div>
    );
  }

  // Generate config and add fill colors dynamically
  const chartConfig: Record<string, { label: string; color: string }> = {};
  
  const palette = [
    "var(--primary)",
    "#FBBF24", // amber
    "#34D399", // emerald
    "#60A5FA", // blue
    "#F472B6", // pink
    "#A78BFA", // purple
  ];

  const pieData = data.map((item, index) => {
    const key = `dept_${index}`;
    chartConfig[key] = {
      label: item.name,
      color: palette[index % palette.length],
    };
    return {
      ...item,
      fill: `var(--color-${key})`,
    };
  });

  const totalPatients = pieData.reduce((acc, curr) => acc + curr.patients, 0);

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-card transition-all hover:shadow-dropdown">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-text-primary">Department Overview</h3>
          <p className="text-[13px] text-text-secondary mt-1">All Time Top 8</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface-secondary text-[12px] font-medium text-text-secondary">
          <Calendar className="size-3.5" />
          <span>All Time</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8 h-[260px] w-full">
        <div className="relative h-full aspect-square">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={pieData}
                dataKey="patients"
                nameKey="name"
                innerRadius={75}
                outerRadius={105}
                paddingAngle={3}
                stroke="var(--surface)"
                strokeWidth={3}
              />
            </PieChart>
          </ChartContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[11px] uppercase tracking-widest font-semibold text-text-secondary mb-1">Total</span>
            <span className="text-3xl font-bold text-text-primary">{totalPatients.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="flex-1 w-full space-y-3 overflow-y-auto pr-2 max-h-full scrollbar-thin">
          {pieData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-3 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="text-[13px] text-text-secondary">{item.name}</span>
              </div>
              <span className="text-[13px] font-semibold text-text-primary">{item.patients.toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-border flex items-center gap-6">
        <div className="w-full">
          <div className="flex justify-between mb-2">
            <span className="text-[12px] text-text-secondary uppercase tracking-wider font-semibold">Total Revenue Generated</span>
            <span className="text-[12px] font-bold text-success">Active</span>
          </div>
          <div className="h-2 w-full bg-surface-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DepartmentChartSkeleton() {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-card min-h-[400px]">
      <div className="h-6 w-40 rounded-md animate-shimmer mb-2" />
      <div className="h-4 w-24 rounded-md animate-shimmer mb-8" />
      <div className="flex items-center gap-8 h-[260px]">
        <div className="size-48 rounded-full border-[16px] border-border/20 animate-pulse shrink-0" />
        <div className="flex-1 space-y-4">
          <div className="h-3 w-full rounded-md animate-shimmer" />
          <div className="h-3 w-3/4 rounded-md animate-shimmer" />
          <div className="h-3 w-5/6 rounded-md animate-shimmer" />
          <div className="h-3 w-2/3 rounded-md animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
