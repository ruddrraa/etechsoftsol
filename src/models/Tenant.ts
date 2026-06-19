import mongoose, { Schema, Document, Model } from "mongoose";
import type { TenantStatus } from "@/types";

export interface ITenant extends Document {
  name: string;
  clientCode: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  status: TenantStatus;
  logoUrl?: string;
  storageUsedBytes: number;
  storageLimitBytes: number;
  lastUploadAt?: Date;
  settings: {
    timezone: string;
    currency: string;
    alertThresholds: Record<string, unknown>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    name: { type: String, required: true, trim: true },
    clientCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    contactPerson: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, lowercase: true, default: "" },
    address: {
      line1: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "West Bengal" },
      pincode: { type: String, default: "" },
      country: { type: String, default: "India" },
    },
    status: {
      type: String,
      enum: ["active", "suspended", "pending"],
      default: "active",
    },
    logoUrl: String,
    storageUsedBytes: { type: Number, default: 0 },
    storageLimitBytes: { type: Number, default: 5 * 1024 * 1024 * 1024 },
    lastUploadAt: Date,
    settings: {
      timezone: { type: String, default: "Asia/Kolkata" },
      currency: { type: String, default: "INR" },
      alertThresholds: { type: Schema.Types.Mixed, default: {} },
    },
  },
  { timestamps: true }
);

TenantSchema.index({ status: 1 });
TenantSchema.index({ name: "text", clientCode: "text" });

export const Tenant: Model<ITenant> =
  mongoose.models.Tenant ?? mongoose.model<ITenant>("Tenant", TenantSchema);
