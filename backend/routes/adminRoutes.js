import express from "express";
import adminAuthRoutes from "./admin/adminAuthRoutes.js";
import adminIssueRoutes from "./admin/adminIssueRoutes.js";

const router = express.Router();

// 🔐 Mount Admin Auth APIs (/api/admin/login, /api/admin/profile)
router.use("/", adminAuthRoutes);

// 📋 Mount Admin Issue APIs (/api/admin/issues, /api/admin/issues/:id)
router.use("/", adminIssueRoutes);

export default router;