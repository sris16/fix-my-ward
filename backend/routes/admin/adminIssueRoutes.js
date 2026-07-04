import express from "express";
import { getAdminIssues, getAdminIssueById } from "../../controllers/admin/adminIssueController.js";
import { protectAdmin, requireRole } from "../../middleware/adminAuth.js";

const router = express.Router();

// 🔐 Protected Admin Issue APIs (Read-Only for Version 3 Phase 1)
router.get("/issues", protectAdmin, requireRole("admin"), getAdminIssues);
router.get("/issues/:id", protectAdmin, requireRole("admin"), getAdminIssueById);

export default router;
