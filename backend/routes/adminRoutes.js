import express from "express";
import adminAuthRoutes from "./admin/adminAuthRoutes.js";
import {
  getAllIssues,
  getIssueById,
  updateIssue,
} from "../controllers/adminController.js";
import { protectAdmin, requireRole } from "../middleware/adminAuth.js";

const router = express.Router();

// 🔐 Mount Admin Auth APIs (/api/admin/login, /api/admin/profile)
router.use("/", adminAuthRoutes);

// 📋 Admin Issues Routes
router.get("/issues", protectAdmin, requireRole("admin"), getAllIssues);
router.get("/issues/:id", protectAdmin, requireRole("admin"), getIssueById);
router.patch("/issues/:id", protectAdmin, requireRole("admin"), updateIssue);

export default router;