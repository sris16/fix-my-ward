import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import issueRoutes from "./routes/issueRoutes.js";
import citizenRoutes from "./routes/citizenRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"; // ✅ NEW

dotenv.config();

connectDB();

const app = express();

// Image size fix
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cors());

// Routes
app.use("/api/issues", issueRoutes);
app.use("/api/citizens", citizenRoutes);
app.use("/api/admin", adminRoutes); // ✅ NEW

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});