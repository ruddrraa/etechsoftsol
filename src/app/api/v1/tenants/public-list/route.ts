import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Tenant } from "@/models/Tenant";

export async function GET() {
  try {
    await connectDB();

    const tenants = await Tenant.find(
      { status: "active" },
      { name: 1, clientCode: 1 }
    )
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ tenants });
  } catch (err) {
    console.error("[Tenants Public List]", err);
    return NextResponse.json({ tenants: [] }, { status: 500 });
  }
}
