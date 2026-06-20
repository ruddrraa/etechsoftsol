import { config } from "dotenv";
config({ path: ".env.local" });
import { connectDB } from "./src/lib/db/connect";
import { Upload } from "./src/models/Upload";
import mongoose from "mongoose";

async function run() {
  await connectDB();
  const upload = new Upload({
    tenantId: new mongoose.Types.ObjectId(),
    uploadedBy: new mongoose.Types.ObjectId(),
    fileName: "test",
    fileType: "csv",
    fileSizeBytes: 10,
    r2Key: "test",
    r2Url: "test",
    validation: {
        rowCount: 0,
        departments: [],
        errors: [],
        warnings: [],
        duplicateCount: 0,
    }
  });
  
  const bulkWriteError = "Some rows skipped as duplicates.";
  if (bulkWriteError) upload.validation.warnings.push(bulkWriteError);
  
  console.log("Warnings:", upload.validation.warnings);
  console.log("JSON Warnings:", JSON.parse(JSON.stringify(upload.validation.warnings)));
  process.exit(0);
}
run();
