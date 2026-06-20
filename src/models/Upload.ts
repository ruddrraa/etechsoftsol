import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type { UploadStatus } from "@/types";

export interface IUpload extends Document {
  tenantId: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  fileName: string;
  fileType: "xlsx" | "csv";
  fileSizeBytes: number;
  r2Key: string;
  r2Url: string;
  status: UploadStatus;
  validation: {
    rowCount: number;
    dateRangeStart?: Date;
    dateRangeEnd?: Date;
    departments: string[];
    errors: string[];
    warnings: string[];
    duplicateCount: number;
  };
  importStats?: {
    inserted: number;
    skipped: number;
    updated: number;
  };
  fileSchema?: {
    fields: Array<{
      name: string;
      type: "number" | "date" | "category" | "string";
    }>;
  };
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UploadSchema = new Schema<IUpload>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, enum: ["xlsx", "csv"], required: true },
    fileSizeBytes: { type: Number, required: true },
    r2Key: { type: String, required: true },
    r2Url: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "validating", "validated", "importing", "completed", "failed"],
      default: "pending",
    },
    validation: {
      rowCount: { type: Number, default: 0 },
      dateRangeStart: Date,
      dateRangeEnd: Date,
      departments: [String],
      errors: [String],
      warnings: [String],
      duplicateCount: { type: Number, default: 0 },
    },
    importStats: {
      inserted: Number,
      skipped: Number,
      updated: Number,
    },
    fileSchema: {
      fields: [
        {
          name: String,
          type: { type: String, enum: ["number", "date", "category", "string"] },
        },
      ],
    },
    completedAt: Date,
  },
  { timestamps: true }
);

UploadSchema.index({ tenantId: 1, createdAt: -1 });
UploadSchema.index({ status: 1 });

export const Upload: Model<IUpload> =
  mongoose.models.Upload ?? mongoose.model<IUpload>("Upload", UploadSchema);
