import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import { validateEnv } from "./config/validateEnv.js";
import { apiLimiter, authLimiter } from "./middleware/rateLimiter.js";
import { sanitizeInput } from "./middleware/sanitizer.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { logger } from "./utils/logger.js";

import authRoutes from "./routes/authRoutes.js";
import { protect } from "./middleware/authMiddleware.js";
import issueRoutes from "./routes/issueRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();
validateEnv();
connectDB();

const app = express();

// Security HTTP headers & Logging
app.use(helmet());
app.use(morgan("dev"));

// Body parsing & Input Sanitization
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(sanitizeInput);

// CORS configuration
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// Apply Global Rate Limiting
app.use("/api", apiLimiter);

// Rate-limited Auth routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/admin/login", authLimiter);

// General Routes
app.use("/api/issues", issueRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

// Health Check Endpoint for Docker / Kubernetes Monitoring
app.get("/api/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  res.status(200).json({
    success: true,
    status: "Healthy",
    uptime: `${Math.floor(process.uptime())}s`,
    database: dbStatus,
    memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
    timestamp: new Date().toISOString(),
  });
});

// Root Diagnostic Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Fix My Ward API is running cleanly in production mode.",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/test/protected", protect, (req, res) => {
  res.json({
    message: "Protected route accessed!",
    user: req.user,
  });
});

// Centralized Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Global Unhandled Process Exception Guards
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! Shutting down server safely...", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  logger.error("UNHANDLED PROMISE REJECTION! Logging error...", err);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
