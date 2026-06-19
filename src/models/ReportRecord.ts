import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IReportRecord extends Document {
  tenantId: Types.ObjectId;
  uploadId: Types.ObjectId;
  reportDate: Date;
  patientId?: string;
  patientName?: string;
  age?: number;
  gender?: "M" | "F" | "O";
  department: string;
  doctor?: string;
  admissionDate?: Date;
  dischargeDate?: Date;
  revenue?: number;
  pendingBill?: number;
  caseType?: string;
  status?: string;
  totalCount?: number;
  maleCount?: number;
  femaleCount?: number;
  metadata: Record<string, unknown>;
  contentHash: string;
  createdAt: Date;
}

const ReportRecordSchema = new Schema<IReportRecord>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    uploadId: { type: Schema.Types.ObjectId, ref: "Upload", required: true },
    reportDate: { type: Date, required: true, index: true },
    patientId: String,
    patientName: String,
    age: Number,
    gender: { type: String, enum: ["M", "F", "O"] },
    department: { type: String, required: true, index: true },
    doctor: String,
    admissionDate: Date,
    dischargeDate: Date,
    revenue: Number,
    pendingBill: Number,
    caseType: String,
    status: String,
    totalCount: { type: Number, default: 1 },
    maleCount: { type: Number, default: 0 },
    femaleCount: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed, default: {} },
    contentHash: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ReportRecordSchema.index({ tenantId: 1, reportDate: -1 });
ReportRecordSchema.index({ tenantId: 1, department: 1, reportDate: -1 });
ReportRecordSchema.index({ tenantId: 1, contentHash: 1 }, { unique: true });

export const ReportRecord: Model<IReportRecord> =
  mongoose.models.ReportRecord ??
  mongoose.model<IReportRecord>("ReportRecord", ReportRecordSchema);
