import express from "express";
import {
  getAnalyticsOverview,
  getAnalyticsCategories,
  getAnalyticsDepartments,
  getAnalyticsTrends,
  getAnalyticsDistributions,
  getAnalyticsReports
} from "../../controllers/admin/adminAnalyticsController.js";
import { protectAdmin, requireRole } from "../../middleware/adminAuth.js";

const router = express.Router();

// 🔐 Protected Executive Analytics & Intelligence APIs
router.get("/analytics/overview", protectAdmin, requireRole("admin"), getAnalyticsOverview);
router.get("/analytics/categories", protectAdmin, requireRole("admin"), getAnalyticsCategories);
router.get("/analytics/departments", protectAdmin, requireRole("admin"), getAnalyticsDepartments);
router.get("/analytics/trends", protectAdmin, requireRole("admin"), getAnalyticsTrends);
router.get("/analytics/distributions", protectAdmin, requireRole("admin"), getAnalyticsDistributions);
router.get("/analytics/reports", protectAdmin, requireRole("admin"), getAnalyticsReports);

export default router;
