import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type { UserRole, UserStatus } from "@/types";

export interface IUser extends Document {
  tenantId?: Types.ObjectId;
  userId: string;
  email?: string;
  phone?: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  mustChangePassword: boolean;
  lastLoginAt?: Date;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true },
    userId: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "HOSPITAL_ADMIN", "HOSPITAL_USER"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "disabled", "pending_setup"],
      default: "active",
    },
    mustChangePassword: { type: Boolean, default: false },
    lastLoginAt: Date,
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

UserSchema.index({ tenantId: 1, userId: 1 }, { unique: true, sparse: true });
UserSchema.index({ role: 1 });

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);
