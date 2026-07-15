import express from "express";
import {
  getLiveOverview,
  getLiveActivity,
  getLiveIssues
} from "../../controllers/admin/adminLiveMonitorController.js";
import { protectAdmin, requireRole } from "../../middleware/adminAuth.js";

const router = express.Router();

// 🔐 Protected Live Command Center & Real-Time APIs
router.get("/live/overview", protectAdmin, requireRole("admin"), getLiveOverview);
router.get("/live/activity", protectAdmin, requireRole("admin"), getLiveActivity);
router.get("/live/issues", protectAdmin, requireRole("admin"), getLiveIssues);

export default router;
