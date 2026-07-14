import express from "express";
import { getDashboardKPIs } from "../../controllers/admin/adminDashboardController.js";
import { protectAdmin, requireRole } from "../../middleware/adminAuth.js";

const router = express.Router();

// 🔐 Protected Admin Dashboard KPI & Aggregation APIs
router.get("/dashboard/kpis", protectAdmin, requireRole("admin"), getDashboardKPIs);

export default router;
