import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin.js";
import connectDB from "../config/db.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await Admin.findOne({ email: "admin@fixmyward.gov.in" });

    if (!existingAdmin) {
      const admin = await Admin.create({
        name: "Admin Commander",
        email: "admin@fixmyward.gov.in",
        password: "adminpassword123",
        role: "admin",
        department: "Municipal Operations Command",
        designation: "Chief Administrative Officer",
        avatar: "",
        isActive: true,
      });

      console.log("✅ Default Admin account created successfully:");
      console.log("   Email: admin@fixmyward.gov.in");
      console.log("   Password: adminpassword123");
    } else {
      console.log("ℹ️ Default Admin account already exists (admin@fixmyward.gov.in)");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding default admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();
