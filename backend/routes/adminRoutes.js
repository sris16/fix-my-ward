import express from "express";
import {
  getAllIssues,
  getIssueById,
  updateIssue,
} from "../controllers/adminController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔐 All routes protected + admin only
router.get("/issues", protect, adminOnly, getAllIssues);
router.get("/issues/:id", protect, adminOnly, getIssueById);
router.patch("/issues/:id", protect, adminOnly, updateIssue);

export default router;