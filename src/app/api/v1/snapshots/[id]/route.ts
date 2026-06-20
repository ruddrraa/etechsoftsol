import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Upload } from "@/models/Upload";
import { ReportRecord } from "@/models/ReportRecord";
import { getSession } from "@/lib/auth/jwt";
import { deleteFileFromR2 } from "@/lib/r2";
import mongoose from "mongoose";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "HOSPITAL_ADMIN" && session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Only Hospital Admins can delete reports." }, { status: 403 });
    }

    const { id } = await params;

    await connectDB();

    const upload = await Upload.findOne({ _id: id, tenantId: session.tenantId });
    if (!upload) {
      return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
    }

    // Delete records from MongoDB
    await ReportRecord.deleteMany({ uploadId: new mongoose.Types.ObjectId(id), tenantId: new mongoose.Types.ObjectId(session.tenantId) });

    // Delete file from R2
    try {
      if (upload.r2Key && !upload.r2Key.startsWith("r2-failed") && !upload.r2Key.startsWith("r2-not-configured")) {
        await deleteFileFromR2(upload.r2Key);
      }
    } catch (r2Error) {
      console.error("Failed to delete from R2:", r2Error);
    }

    // Delete the upload document
    await upload.deleteOne();

    return NextResponse.json({ success: true, message: "Snapshot deleted successfully" });
  } catch (err) {
    console.error("[Snapshots DELETE Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
