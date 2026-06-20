import { config } from "dotenv";
config({ path: ".env.local" });
import { connectDB } from "./src/lib/db/connect";
import { ReportRecord } from "./src/models/ReportRecord";
import mongoose from "mongoose";

async function run() {
  await connectDB();
  const tenantId = new mongoose.Types.ObjectId();
  const uploadId = new mongoose.Types.ObjectId();
  
  const records = [{
    tenantId, uploadId, reportDate: new Date(), data: { a: 1 }, contentHash: "hash1"
  }];
  
  try {
    await ReportRecord.insertMany(records, { ordered: false });
    console.log("First insert ok");
    await ReportRecord.insertMany(records, { ordered: false });
    console.log("Second insert ok");
  } catch (e: any) {
    console.log("Code:", e.code);
    console.log("Inserted docs length:", e.insertedDocs?.length);
    console.log("Result:", e.result);
  }
  process.exit(0);
}
run();
