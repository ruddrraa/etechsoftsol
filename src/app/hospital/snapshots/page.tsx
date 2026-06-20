"use client";

import { useState, useEffect } from "react";
import { Download, FileText, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Snapshot {
  _id: string;
  filename?: string;
  recordCount: number;
  createdAt: string;
  url: string;
}

export default function SnapshotsPage() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSnapshots();
  }, []);

  async function fetchSnapshots() {
    try {
      const res = await fetch("/api/v1/snapshots");
      if (res.ok) {
        const data = await res.json();
        setSnapshots(data.snapshots || []);
        if (data.role) setUserRole(data.role);
      }
    } catch (err) {
      console.error("Failed to load snapshots", err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this snapshot? This will remove all associated records from the dashboard.")) return;
    
    try {
      setDeletingId(id);
      const res = await fetch(`/api/v1/snapshots/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      
      toast.success("Snapshot deleted successfully");
      fetchSnapshots(); // refresh list
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Report Snapshots</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage your uploaded report histories.
        </p>
      </div>
      
      <div className="rounded-2xl border border-border glass-panel shadow-elevated">
        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <Loader2 className="animate-spin size-6 text-muted-foreground" />
          </div>
        ) : snapshots.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No snapshots available yet. Upload reports to generate snapshots.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {snapshots.map((snap) => (
              <div key={snap._id} className="flex items-center justify-between p-5 hover:bg-surface-secondary transition-colors border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{snap.filename || "Report Upload"}</p>
                    <p className="text-xs text-muted-foreground">
                      Processed {snap.recordCount} records • {new Date(snap.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => alert("Downloading CSV...")} className="bg-surface hover:bg-surface-secondary border-border text-foreground">
                    <Download className="size-4 mr-2" />
                    Download CSV
                  </Button>
                  {(userRole === "HOSPITAL_ADMIN" || userRole === "SUPER_ADMIN") && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(snap._id)} 
                      disabled={deletingId === snap._id}
                      className="bg-surface hover:bg-danger/10 hover:text-danger hover:border-danger/30 border-border text-muted-foreground transition-colors"
                    >
                      {deletingId === snap._id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
