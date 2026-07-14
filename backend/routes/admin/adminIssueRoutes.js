import express from "express";
import {
  getAdminIssues,
  getAdminIssueById,
  verifyAdminIssue,
  rejectAdminIssue,
  assignAdminIssue,
  updateAdminIssuePriority,
  updateAdminIssueStatus,
} from "../../controllers/admin/adminIssueController.js";
import { protectAdmin, requireRole } from "../../middleware/adminAuth.js";

const router = express.Router();

// 🔐 Protected Admin Issue APIs
router.get("/issues", protectAdmin, requireRole("admin"), getAdminIssues);
router.get("/issues/:id", protectAdmin, requireRole("admin"), getAdminIssueById);

// Phase 2: Verify & Reject
router.patch("/issues/:id/verify", protectAdmin, requireRole("admin"), verifyAdminIssue);
router.patch("/issues/:id/reject", protectAdmin, requireRole("admin"), rejectAdminIssue);

// Phase 3: Department Assignment
router.patch("/issues/:id/assign", protectAdmin, requireRole("admin"), assignAdminIssue);

// Phase 4: Priority Management
router.patch("/issues/:id/priority", protectAdmin, requireRole("admin"), updateAdminIssuePriority);

// Phase 5: Status Workflow
router.patch("/issues/:id/status", protectAdmin, requireRole("admin"), updateAdminIssueStatus);

export default router;
