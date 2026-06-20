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
    const result = await ReportRecord.insertMany(records, { ordered: false });
    console.log("Result type:", Array.isArray(result) ? "Array" : typeof result);
    console.log("Result:", result);
    console.log("Result length:", result.length);
  } catch (e) {
    console.error("Error", e);
  }
  process.exit(0);
}
run();
