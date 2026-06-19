"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart as ChartLine, Calendar } from "lucide-react";

interface RevenueChartProps {
  data: Array<{ name: string; revenue: number | null }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "var(--primary)",
    },
  };

  const validPoints = data.filter(d => d.revenue !== null && d.revenue !== undefined).length;

  if (validPoints < 3) {
    return (
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-card flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="size-12 rounded-full bg-surface-secondary flex items-center justify-center mb-4">
          <ChartLine className="size-6 text-text-secondary opacity-50" />
        </div>
        <h3 className="text-sm font-semibold text-text-primary mb-2">Insufficient Data</h3>
        <p className="text-[13px] text-text-secondary max-w-[250px] leading-relaxed">
          More report uploads are required before trend analysis becomes available.
        </p>
      </div>
    );
  }

  // Calculate Growth (last valid vs previous valid)
  const validData = data.filter(d => d.revenue !== null) as Array<{name: string, revenue: number}>;
  const currentVal = validData[validData.length - 1]?.revenue || 0;
  const prevVal = validData[validData.length - 2]?.revenue || 0;
  const growth = prevVal === 0 ? 0 : ((currentVal - prevVal) / prevVal) * 100;
  const isPositive = growth >= 0;

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-card transition-all hover:shadow-dropdown">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-text-primary">Revenue Trends</h3>
          <p className="text-[13px] text-text-secondary mt-1">Last 30 Days</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface-secondary text-[12px] font-medium text-text-secondary">
          <Calendar className="size-3.5" />
          <span>Last 30 Days</span>
        </div>
      </div>
      
      <div className="h-[260px] w-full">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
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
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
              dx={-10}
            />
            <ChartTooltip
              cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '4 4' }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              type="natural"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              strokeWidth={3}
              fill="url(#colorRevenue)"
              connectNulls={true}
              dot={{ r: 4, fill: "var(--surface)", stroke: "var(--color-revenue)", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "var(--surface)", stroke: "var(--color-revenue)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ChartContainer>
      </div>

      <div className="mt-6 pt-5 border-t border-border flex items-center gap-6">
        <div>
          <p className="text-[12px] text-text-secondary uppercase tracking-wider font-semibold mb-1">Current Revenue</p>
          <p className="text-xl font-bold text-text-primary">₹{currentVal.toLocaleString("en-IN")}</p>
        </div>
        <div>
          <p className="text-[12px] text-text-secondary uppercase tracking-wider font-semibold mb-1">Growth</p>
          <div className="flex items-center gap-1.5">
            <div className={`px-2 py-0.5 rounded-full text-[12px] font-bold ${isPositive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
              {isPositive ? '↑' : '↓'} {Math.abs(growth).toFixed(1)}%
            </div>
            <span className="text-[12px] text-text-secondary">vs prev report</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RevenueChartSkeleton() {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-card min-h-[400px]">
      <div className="h-6 w-40 rounded-md animate-shimmer mb-2" />
      <div className="h-4 w-24 rounded-md animate-shimmer mb-8" />
      <div className="h-[260px] rounded-lg animate-shimmer" />
    </div>
  );
}
