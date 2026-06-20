"use client";

import { useState, useCallback } from "react";
import { UploadCloud, FileType, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateAndSetFile = (file: File) => {
    const validTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv"
    ];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast.error("Invalid file type. Please upload Excel or CSV files.");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 10MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("file", selectedFile);
    
    try {
      const res = await fetch("/api/v1/uploads", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload file");
      }
      
      if (data.upload.stats.inserted === 0) {
        if (data.upload.warnings && data.upload.warnings.length > 0) {
          toast.error(`0 records inserted. ${data.upload.warnings[0]}`);
        } else {
          toast.error("0 records inserted. All records were duplicates or invalid.");
        }
      } else if (data.upload.stats.skipped > 0) {
        toast.warning(`Upload complete! Inserted ${data.upload.stats.inserted} records. Skipped ${data.upload.stats.skipped} duplicates/invalid rows.`);
      } else {
        toast.success(`Upload complete! Inserted ${data.upload.stats.inserted} records.`);
      }

      setSelectedFile(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div>
        <h1 className="text-xl font-semibold font-[family-name:var(--font-geist)] text-foreground flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <UploadCloud className="size-4 text-primary" />
          </div>
          Upload Report
        </h1>
        <p className="text-[13px] text-muted-foreground mt-1.5 ml-10">
          Upload your daily hospital MIS reports in Excel or CSV format
        </p>
      </div>

      <div className="mt-8">
        <div
          className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-200 ${
            isDragging
              ? "border-primary bg-primary/10 shadow-[inset_0px_0px_20px_rgba(249,115,22,0.15)]"
              : "border-border glass-panel hover:bg-surface-secondary hover:border-primary/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <UploadCloud className="size-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold font-[family-name:var(--font-geist)] text-foreground">
              Drag & drop your file here
            </h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Supports .xlsx, .xls, and .csv formats up to 10MB
            </p>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="file"
                  id="file-upload"
                  className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <Button variant="outline" className="rounded-xl pointer-events-none peer-hover:bg-accent peer-hover:text-accent-foreground">
                  Browse Files
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedFile && (
        <div className="rounded-2xl border border-border glass-panel p-5 shadow-elevated animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[#06B6D4]/10">
                <FileType className="size-5 text-[#06B6D4]" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground"
                onClick={() => setSelectedFile(null)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                className="rounded-lg bg-primary hover:bg-primary/90"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Confirm Upload"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions / Validation Guidelines */}
      <div className="mt-8 rounded-2xl border border-border glass-panel p-6 shadow-soft">
        <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertCircle className="size-4 text-muted-foreground" />
          Upload Guidelines
        </h4>
        <ul className="space-y-3">
          {[
            "Ensure the first row of your file contains column headers.",
            "Include a Date column (e.g., 'Report_Date', 'Date') for time-series tracking.",
            "Include numeric columns (e.g., 'Count', 'Revenue') for dashboard KPIs.",
            "Standard Users can upload 1 report per day. Admins can upload multiple reports."
          ].map((guideline, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{guideline}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
