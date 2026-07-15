import express from "express";
import {
  getAdminCitizens,
  getAdminCitizenById
} from "../../controllers/admin/adminCitizenController.js";
import { protectAdmin, requireRole } from "../../middleware/adminAuth.js";

const router = express.Router();

// 🔐 Protected Citizen Intelligence & Engagement APIs (Read-Only per Version 9 spec)
router.get("/citizens", protectAdmin, requireRole("admin"), getAdminCitizens);
router.get("/citizens/:id", protectAdmin, requireRole("admin"), getAdminCitizenById);

export default router;
