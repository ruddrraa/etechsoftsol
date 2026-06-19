import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Notification } from "@/models/Notification";
import { getSession } from "@/lib/auth/jwt";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    await connectDB();

    const query: any = { userId: session.id };
    if (unreadOnly) {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({ userId: session.id, read: false });

    return NextResponse.json({ success: true, notifications, unreadCount });
  } catch (err) {
    console.error("[Notifications GET Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
