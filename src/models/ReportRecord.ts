import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IReportRecord extends Document {
  tenantId: Types.ObjectId;
  uploadId: Types.ObjectId;
  reportDate: Date;
  data: Record<string, any>;
  contentHash: string;
  createdAt: Date;
}

const ReportRecordSchema = new Schema<IReportRecord>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    uploadId: { type: Schema.Types.ObjectId, ref: "Upload", required: true },
    reportDate: { type: Date, required: true, index: true },
    data: { type: Schema.Types.Mixed, default: {} },
    contentHash: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ReportRecordSchema.index({ tenantId: 1, reportDate: -1 });
ReportRecordSchema.index({ tenantId: 1, contentHash: 1 }, { unique: true });

export const ReportRecord: Model<IReportRecord> =
  mongoose.models.ReportRecord ??
  mongoose.model<IReportRecord>("ReportRecord", ReportRecordSchema);
