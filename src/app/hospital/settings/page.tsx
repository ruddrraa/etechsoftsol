"use client";

import { useState } from "react";
import { Settings, Lock, Building2, Save, Loader2, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SettingsPage() {
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    // Simulate API call
    setTimeout(() => {
      setSavingProfile(false);
      toast.success("Profile preferences saved successfully");
    }, 1000);
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    
    const form = e.target as HTMLFormElement;
    const currentPassword = (form.elements.namedItem('current_password') as HTMLInputElement).value;
    const newPassword = (form.elements.namedItem('new_password') as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem('confirm_password') as HTMLInputElement).value;

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      setSavingPassword(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success("Password updated successfully");
        form.reset();
      } else {
        toast.error(data.error || "Failed to update password");
      }
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div>
        <h1 className="text-xl font-semibold font-[family-name:var(--font-geist)] text-foreground flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Settings className="size-4 text-primary" />
          </div>
          Settings & Preferences
        </h1>
        <p className="text-[13px] text-muted-foreground mt-1.5 ml-10">
          Manage your account details and platform preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleProfileSave} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="flex items-center gap-2 text-base font-semibold font-[family-name:var(--font-geist)] text-foreground mb-6">
              <Building2 className="size-4 text-muted-foreground" />
              General Information
            </h3>
            
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm">Full Name</Label>
                  <Input id="name" defaultValue="John Doe" className="h-10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">Email Address</Label>
                  <Input id="email" type="email" defaultValue="john.doe@hospital.com" className="h-10 rounded-xl" />
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-sm">Timezone</Label>
                  <select id="timezone" className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-sm">Default Currency</Label>
                  <select id="currency" className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end pt-4 border-t border-border">
              <Button type="submit" className="rounded-xl h-10" disabled={savingProfile}>
                {savingProfile ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
                Save Changes
              </Button>
            </div>
          </form>

          {/* Password Settings */}
          <form onSubmit={handlePasswordSave} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="flex items-center gap-2 text-base font-semibold font-[family-name:var(--font-geist)] text-foreground mb-6">
              <Lock className="size-4 text-muted-foreground" />
              Security Settings
            </h3>
            
            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="current_password" className="text-sm">Current Password</Label>
                <Input id="current_password" type="password" required className="h-10 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_password" className="text-sm">New Password</Label>
                <Input id="new_password" type="password" required minLength={8} className="h-10 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password" className="text-sm">Confirm New Password</Label>
                <Input id="confirm_password" type="password" required minLength={8} className="h-10 rounded-xl" />
              </div>
            </div>

            <div className="mt-8 flex justify-end pt-4 border-t border-border">
              <Button type="submit" variant="secondary" className="rounded-xl h-10 bg-[#F1F5F9] text-foreground hover:bg-[#E2E8F0]" disabled={savingPassword}>
                {savingPassword ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Key className="mr-2 size-4 text-muted-foreground" />}
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
