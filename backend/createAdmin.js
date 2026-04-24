import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/Admin.js";
import connectDB from "./config/db.js";

dotenv.config();

connectDB();

const createAdmin = async () => {
  try {
    const existing = await Admin.findOne({ username: "admin" });

    if (existing) {
      console.log("Admin already exists ❌");
      process.exit();
    }

    const admin = await Admin.create({
      username: "admin",
      password: "1234" // 🔐 will be hashed automatically
    });

    console.log("Admin created successfully ✅");
    console.log(admin);

    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createAdmin();