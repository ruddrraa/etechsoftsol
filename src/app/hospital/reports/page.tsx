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
  const [reports, setReports] = useState<Report[]>([]);
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
      setReports(data.reports ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReports();
  }, []);

  const handleExportCsv = () => {
    window.location.href = "/api/v1/reports/export?format=csv";
    toast.success("Download started");
  };

  const columns: ColumnDef<Report>[] = [
    {
      accessorKey: "reportDate",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("reportDate") as string;
        return date ? format(new Date(date), "MMM dd, yyyy") : "N/A";
      },
    },
    {
      accessorKey: "patientId",
      header: "Patient ID",
    },
    {
      accessorKey: "patientName",
      header: "Patient Name",
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.getValue("patientName")}
        </span>
      ),
    },
    {
      accessorKey: "department",
      header: "Department",
    },
    {
      accessorKey: "doctor",
      header: "Doctor",
    },
    {
      accessorKey: "revenue",
      header: "Revenue",
      cell: ({ row }) => {
        const val = row.getValue("revenue") as number;
        return val ? `₹${val.toLocaleString("en-IN")}` : "₹0";
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = (row.getValue("status") as string)?.toLowerCase();
        let bg = "bg-slate-500/10 text-slate-400";
        if (status === "discharged") bg = "bg-emerald-500/10 text-emerald-400";
        if (status === "admitted") bg = "bg-[#06B6D4]/10 text-[#06B6D4]";
        if (status === "pending") bg = "bg-amber-500/10 text-amber-400";

        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${bg}`}>
            {status || "Unknown"}
          </span>
        );
      },
    },
  ];

  if (error) {
    return (
      <div className="mx-auto max-w-[1200px]">
        <PageError onRetry={fetchReports} />
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
        searchPlaceholder="Search patients, doctors..."
        onExportCsv={handleExportCsv}
      />
    </div>
  );
}
