"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: "up" | "down" | "neutral";
  icon?: LucideIcon;
  className?: string;
  index?: number;
  loading?: boolean;
}

export function KpiCard({
  label,
  value,
  change,
  changeLabel = "Last Month",
  trend,
  icon: Icon,
  className,
  index = 0,
  loading = false,
} : KpiCardProps) {
  const resolvedTrend =
    trend ?? (change !== undefined ? (change > 0 ? "up" : change < 0 ? "down" : "neutral") : undefined);

  if (loading) {
    return <KpiCardSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-card transition-shadow duration-200",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-[12px] uppercase tracking-wider font-bold text-text-secondary">{label}</p>
        {Icon && (
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="size-4 text-primary" />
          </div>
        )}
      </div>

      <p className="mt-3 text-[32px] font-bold font-[family-name:var(--font-geist)] tracking-tight text-text-primary leading-none">
        {value}
      </p>

      {change !== undefined && (
        <div className="mt-3 flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold",
              resolvedTrend === "up" && "text-success bg-success/10",
              resolvedTrend === "down" && "text-danger bg-danger/10",
              resolvedTrend === "neutral" && "text-text-secondary bg-surface-secondary"
            )}
          >
            {resolvedTrend === "up" && <TrendingUp className="size-3" />}
            {resolvedTrend === "down" && <TrendingDown className="size-3" />}
            {change > 0 ? "+" : ""}{change}%
          </span>
          <span className="text-[11px] font-medium text-text-secondary">{changeLabel}</span>
        </div>
      )}
    </motion.div>
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-card">
      <div className="h-4 w-24 rounded-md animate-shimmer" />
      <div className="mt-3 h-8 w-32 rounded-md animate-shimmer" />
      <div className="mt-3 h-4 w-20 rounded-md animate-shimmer" />
    </div>
  );
}
