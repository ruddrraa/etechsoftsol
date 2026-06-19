import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Upload } from "@/models/Upload";
import { getSession } from "@/lib/auth/jwt";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const snapshots = await Upload.find({ tenantId: session.tenantId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({ success: true, snapshots });
  } catch (err) {
    console.error("[Snapshots GET Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
