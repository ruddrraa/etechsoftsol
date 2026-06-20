import { config } from "dotenv";
config({ path: ".env.local" });
import { connectDB } from "./src/lib/db/connect";
import { ReportRecord } from "./src/models/ReportRecord";

async function run() {
  await connectDB();
  const count = await ReportRecord.countDocuments();
  console.log("Total ReportRecords:", count);
  process.exit(0);
}
run();
