import { connectDB } from "./src/lib/db/connect";
import { User } from "./src/models/User";
import { hashPassword } from "./src/lib/auth/password";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function seedAdmin() {
  try {
    await connectDB();
    
    const email = process.env.SUPER_ADMIN_EMAIL || "excel.rks@gmail.com";
    const password = process.env.SUPER_ADMIN_PASSWORD || "Ranjit@2020";

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log("Admin already exists. Updating password...");
      existingAdmin.passwordHash = await hashPassword(password);
      await existingAdmin.save();
      console.log("Admin password updated!");
    } else {
      console.log("Creating super admin...");
      const passwordHash = await hashPassword(password);
      await User.create({
        userId: "admin",
        name: "Super Admin",
        email: email,
        passwordHash,
        role: "SUPER_ADMIN",
        mustChangePassword: false,
      });
      console.log("Super admin created successfully!");
    }
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed admin:", error);
    process.exit(1);
  }
}

seedAdmin();
