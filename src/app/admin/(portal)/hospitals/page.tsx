"use client";

import { useState, useEffect, useRef } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/dashboard/data-table";
import { PageError } from "@/components/dashboard/page-states";
import { Building2, Plus, Upload, MoreHorizontal, Ban, Loader2, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Hospital {
  _id: string;
  name: string;
  clientCode: string;
  status: string;
  createdAt: string;
}

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [passwordModal, setPasswordModal] = useState<{ isOpen: boolean; hospitalId: string | null; currentUsername?: string }>({ isOpen: false, hospitalId: null });
  const [newPassword, setNewPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch("/api/v1/admin/tenants");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setHospitals(data.tenants ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleAddHospital = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData);

    try {
      const res = await fetch("/api/v1/admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add hospital");

      toast.success("Hospital added successfully");
      setIsAddModalOpen(false);
      fetchHospitals();
    } catch (err: any) {
      toast.error(err.message || "Failed to add hospital");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/v1/admin/tenants/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to import CSV");

      toast.success(`Imported successfully. Inserted: ${data.stats.inserted}, Skipped: ${data.stats.skipped}`);
      if (data.stats.errors?.length > 0) {
        console.error("Import Errors:", data.stats.errors);
        toast.warning("Some rows failed to import. Check console.");
      }
      fetchHospitals();
    } catch (err: any) {
      toast.error(err.message || "Failed to import CSV");
    } finally {
      setIsSubmitting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!passwordModal.hospitalId || (!newPassword && !newUsername)) return;

    setIsSettingPassword(true);
    try {
      const res = await fetch(`/api/v1/admin/tenants/${passwordModal.hospitalId}/credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          password: newPassword || undefined,
          adminUsername: newUsername || undefined 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update credentials");

      toast.success("Admin credentials updated successfully");
      setPasswordModal({ isOpen: false, hospitalId: null, currentUsername: undefined });
      setNewPassword("");
      setNewUsername("");
      fetchHospitals(); // Refresh table
    } catch (err: any) {
      toast.error(err.message || "Failed to update credentials");
    } finally {
      setIsSettingPassword(false);
    }
  };

  const columns: ColumnDef<Hospital>[] = [
    {
      accessorKey: "name",
      header: "Hospital Name",
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "clientCode",
      header: "Client Code",
    },
    {
      accessorKey: "adminUsername",
      header: "Admin User ID",
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.getValue("adminUsername") || "N/A"}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status || "active";
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
              status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex size-8 items-center justify-center rounded-lg hover:bg-slate-100 outline-none transition-colors">
                <MoreHorizontal className="size-4 text-muted-foreground" />
                <span className="sr-only">Open menu</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => alert("Edit modal would open here")}>
                  Edit details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setPasswordModal({ isOpen: true, hospitalId: row.original._id, currentUsername: (row.original as any).adminUsername });
                  setNewUsername((row.original as any).adminUsername || "");
                }}>
                  <Key className="mr-2 size-4" />
                  Set Admin Credentials
                </DropdownMenuItem>
                <DropdownMenuItem className="text-amber-600 focus:text-amber-600">
                  <Ban className="mr-2 size-4" />
                  Disable hospital
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={async () => {
                    if (confirm("Are you sure you want to delete this hospital?")) {
                      try {
                        const res = await fetch(`/api/v1/admin/tenants/${row.original._id}`, {
                          method: "DELETE"
                        });
                        if (res.ok) {
                          toast.success("Hospital deleted successfully");
                          fetchHospitals();
                        } else {
                          toast.error("Failed to delete hospital");
                        }
                      } catch (err) {
                        toast.error("Error deleting hospital");
                      }
                    }
                  }}
                >
                  <Ban className="mr-2 size-4" />
                  Delete hospital
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  if (error) {
    return (
      <div className="mx-auto max-w-[1200px]">
        <PageError onRetry={fetchHospitals} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold font-[family-name:var(--font-geist)] text-foreground flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="size-4 text-primary" />
            </div>
            Hospitals
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1.5 ml-10">
            Manage your hospital clients and tenant access
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImportCSV} 
          />
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl h-10 bg-[#F8FAFC] w-full sm:w-auto"
          >
            <Upload className="mr-2 size-4 text-muted-foreground" />
            Import CSV
          </Button>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-xl h-10 bg-[#2563EB] hover:bg-[#1D4ED8] w-full sm:w-auto"
          >
            <Plus className="mr-2 size-4" />
            Add Hospital
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={hospitals}
        loading={loading}
        searchPlaceholder="Search by hospital name or code..."
      />

      {/* Add Hospital Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold font-[family-name:var(--font-geist)] text-foreground">Add New Hospital</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleAddHospital} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Hospital Name</Label>
                <Input id="name" name="name" required placeholder="e.g. City General Hospital" className="h-10 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientCode">Client Code (Unique ID)</Label>
                <Input id="clientCode" name="clientCode" required placeholder="e.g. CGH-001" className="h-10 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminUsername">Admin Username</Label>
                <Input id="adminUsername" name="adminUsername" type="text" required placeholder="e.g. admin_cgh" className="h-10 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Initial Admin Password</Label>
                <Input id="adminPassword" name="adminPassword" type="password" required placeholder="••••••••" className="h-10 rounded-xl" />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="rounded-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  Create Hospital
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set Credentials Modal */}
      {passwordModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-sm rounded-2xl shadow-xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold font-[family-name:var(--font-geist)] text-foreground">Set Admin Credentials</h2>
              <button 
                onClick={() => setPasswordModal({ isOpen: false, hospitalId: null, currentUsername: undefined })}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleSetPassword} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newUsername">Admin User ID (Username)</Label>
                <Input 
                  id="newUsername" 
                  name="newUsername" 
                  type="text" 
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. admin123" 
                  className="h-10 rounded-xl" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password (Optional)</Label>
                <Input 
                  id="newPassword" 
                  name="newPassword" 
                  type="text" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave blank to keep current" 
                  className="h-10 rounded-xl" 
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setPasswordModal({ isOpen: false, hospitalId: null, currentUsername: undefined })}
                  className="rounded-xl"
                  disabled={isSettingPassword}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="rounded-xl"
                  disabled={isSettingPassword}
                >
                  {isSettingPassword ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  Save Credentials
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
