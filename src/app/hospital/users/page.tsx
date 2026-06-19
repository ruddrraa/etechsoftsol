"use client";

import { useState, useEffect } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { DataTable } from "@/components/dashboard/data-table";
import { PageError } from "@/components/dashboard/page-states";
import { Users, Plus, MoreHorizontal, Ban, Key, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface User {
  _id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLoginAt?: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch("/api/v1/users");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData);

    try {
      const res = await fetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");

      toast.success("User created successfully");
      setIsAddModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisableUser = async (id: string, currentStatus: string) => {
    if (!confirm(`Are you sure you want to ${currentStatus === "active" ? "disable" : "enable"} this user?`)) return;
    
    try {
      const newStatus = currentStatus === "active" ? "disabled" : "active";
      const res = await fetch(`/api/v1/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update user");
      toast.success(`User ${newStatus === "active" ? "enabled" : "disabled"} successfully`);
      fetchUsers();
    } catch {
      toast.error("Failed to update user status");
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">{row.getValue("name")}</p>
          <p className="text-[11px] text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "userId",
      header: "User ID",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize bg-slate-100 text-slate-700">
            {role.toLowerCase().replace(/_/g, " ")}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
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
      accessorKey: "lastLoginAt",
      header: "Last Login",
      cell: ({ row }) => {
        const date = row.getValue("lastLoginAt") as string;
        return date ? formatDistanceToNow(new Date(date), { addSuffix: true }) : "Never";
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
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
                <DropdownMenuItem onClick={() => alert("Reset password logic")}>
                  <Key className="mr-2 size-4" />
                  Reset password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleDisableUser(user._id, user.status)}
                  className={user.status === "active" ? "text-amber-600 focus:text-amber-600" : "text-emerald-600 focus:text-emerald-600"}
                >
                  <Ban className="mr-2 size-4" />
                  {user.status === "active" ? "Disable access" : "Enable access"}
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
        <PageError onRetry={fetchUsers} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold font-[family-name:var(--font-geist)] text-foreground flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <Users className="size-4 text-primary" />
            </div>
            Team Members
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1.5 ml-10">
            Manage hospital staff access and roles
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="rounded-xl h-10 w-full sm:w-auto">
          <Plus className="mr-2 size-4" />
          Create User
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        searchPlaceholder="Search by name, email, or ID..."
      />

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold font-[family-name:var(--font-geist)] text-foreground">Add New User</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" required placeholder="e.g. Dr. John Doe" className="h-10 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userId">User ID (Username)</Label>
                <Input id="userId" name="userId" required placeholder="e.g. jdoe123" className="h-10 rounded-xl" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" required defaultValue="HOSPITAL_USER">
                  <SelectTrigger className="w-full h-10 rounded-xl bg-white border-input hover:border-ring/50">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOSPITAL_ADMIN">Hospital Admin (Full Access)</SelectItem>
                    <SelectItem value="HOSPITAL_USER">Hospital User (Limited Access)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Initial Password</Label>
                <Input id="password" name="password" type="password" required placeholder="••••••••" className="h-10 rounded-xl" />
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
                  Create User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
