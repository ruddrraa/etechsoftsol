"use client";

import { useState, useEffect } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { DataTable } from "@/components/dashboard/data-table";
import { PageError } from "@/components/dashboard/page-states";
import { FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

interface Report {
  _id: string;
  reportDate: string;
  patientId: string;
  patientName: string;
  department: string;
  doctor: string;
  revenue: number;
  pendingBill: number;
  status: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [schema, setSchema] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(false);
      // Fetching all (up to 1000 for client-side filtering/pagination in this phase)
      const res = await fetch("/api/v1/reports?limit=1000");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSchema(data.schema || []);
      setReports(data.reports ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCsv = () => {
    if (!reports || reports.length === 0) return;
    const headers = Object.keys(reports[0]).join(",");
    const rows = reports.map((row: any) => 
      Object.values(row).map(val => `"${val}"`).join(",")
    );
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "patient_reports.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: ColumnDef<any>[] = schema.map((field: any) => ({
    accessorKey: field.name,
    header: field.name.replace(/_/g, " "),
    cell: ({ row }: any) => {
      const val = row.getValue(field.name);
      return <span>{val !== null && val !== undefined ? String(val) : "-"}</span>;
    }
  }));

  if (error) {
    return (
      <div className="mx-auto max-w-[1200px]">
        <PageError onRetry={fetchReports} />
      </div>
    );
  }

  if (!loading && (!schema || schema.length === 0)) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-6">
        <div>
          <h1 className="text-xl font-semibold font-[family-name:var(--font-geist)] text-foreground">Patient Reports</h1>
        </div>
        <div className="rounded-[var(--radius-card)] border border-dashed border-border bg-surface px-6 py-16 text-center">
          <p className="text-sm text-text-secondary mb-4">No data available. Upload a report first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold font-[family-name:var(--font-geist)] text-foreground flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <FileSpreadsheet className="size-4 text-primary" />
            </div>
            Patient Reports
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1.5 ml-10">
            View, search, and export all uploaded patient records
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={reports}
        loading={loading}
        searchPlaceholder="Search reports..."
        onExportCsv={handleExportCsv}
      />
    </div>
  );
}
