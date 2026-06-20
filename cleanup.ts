import { config } from "dotenv";
config({ path: ".env.local" });
import { connectDB } from "./src/lib/db/connect";
import { ReportRecord } from "./src/models/ReportRecord";
import { Upload } from "./src/models/Upload";
import mongoose from "mongoose";

async function run() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");
    
    // Find all unique uploadIds in ReportRecord
    const uploadIdsInRecords = await ReportRecord.distinct("uploadId");
    console.log(`Found ${uploadIdsInRecords.length} unique uploadIds in ReportRecord`);
    
    let orphanedCount = 0;
    
    for (const uploadId of uploadIdsInRecords) {
      const uploadExists = await Upload.exists({ _id: uploadId });
      if (!uploadExists) {
        console.log(`Upload ${uploadId} does not exist. Deleting associated ReportRecords...`);
        const result = await ReportRecord.deleteMany({ uploadId });
        console.log(`Deleted ${result.deletedCount} orphaned records for upload ${uploadId}`);
        orphanedCount += result.deletedCount;
      }
    }
    
    console.log(`Cleanup complete. Total orphaned records deleted: ${orphanedCount}`);
    process.exit(0);
  } catch (e) {
    console.error("Error", e);
    process.exit(1);
  }
}

run();
