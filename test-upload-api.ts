import { config } from "dotenv";
config({ path: ".env.local" });
import { POST } from "./src/app/api/v1/uploads/route";
import { NextRequest } from "next/server";
import mongoose from "mongoose";

async function run() {
  const formData = new FormData();
  // We need to create a File object. FormData accepts Blob/File in node if using undici.
  const blob = new Blob(["a,b\n1,2\n1,2"], { type: "text/csv" });
  formData.append("file", blob, "test.csv");

  const req = new NextRequest("http://localhost/api/v1/uploads", {
    method: "POST",
    headers: {
      "x-tenant-id": "6a365471f3e7688eeb391f9b",
      "x-user-id": "6a365471f3e7688eeb391f9b",
      "x-user-role": "HOSPITAL_ADMIN",
    },
    body: formData,
  });

  const res = await POST(req);
  const json = await res.json();
  console.log("Status:", res.status);
  console.log("JSON:", JSON.stringify(json, null, 2));
  process.exit(0);
}
run();
