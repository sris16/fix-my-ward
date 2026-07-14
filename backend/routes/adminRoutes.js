import express from "express";
import adminAuthRoutes from "./admin/adminAuthRoutes.js";
import adminIssueRoutes from "./admin/adminIssueRoutes.js";
import adminDashboardRoutes from "./admin/adminDashboardRoutes.js";

const router = express.Router();

// 🔐 Mount Admin Auth APIs (/api/admin/login, /api/admin/profile)
router.use("/", adminAuthRoutes);

// 📋 Mount Admin Issue APIs (/api/admin/issues, /api/admin/issues/:id, /api/admin/issues/:id/timeline, /notes)
router.use("/", adminIssueRoutes);

// 📊 Mount Admin Dashboard KPI APIs (/api/admin/dashboard/kpis)
router.use("/", adminDashboardRoutes);

export default router;