import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import issueRoutes from "./routes/issueRoutes.js";
import citizenRoutes from "./routes/citizenRoutes.js";

dotenv.config();

connectDB();

const app = express();

/* FIX IMAGE SIZE LIMIT */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cors());

app.use("/api/issues", issueRoutes);
app.use("/api/citizens", citizenRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});