"use client";

import { useState, useEffect } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    async function fetchSnapshots() {
      try {
        const res = await fetch("/api/v1/snapshots");
        if (res.ok) {
          const data = await res.json();
          setSnapshots(data.snapshots || []);
        }
      } catch (err) {
        console.error("Failed to load snapshots", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSnapshots();
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Report Snapshots</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and download your uploaded report histories.
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
              <div key={snap._id} className="flex items-center justify-between p-5 hover:bg-[#1A1A1A] transition-colors border-b border-border last:border-0">
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
                <Button variant="outline" size="sm" onClick={() => alert("Downloading CSV...")} className="bg-[#1A1A1A] hover:bg-[#262626] border-border text-foreground">
                  <Download className="size-4 mr-2" />
                  Download CSV
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
