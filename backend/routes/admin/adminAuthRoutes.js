import express from "express";
import { loginAdmin, getAdminProfile } from "../../controllers/admin/adminAuthController.js";
import { protectAdmin, requireRole } from "../../middleware/adminAuth.js";

const router = express.Router();

// 🔓 Public Admin Login API
router.post("/login", loginAdmin);

// 🔐 Protected Admin Profile API
router.get("/profile", protectAdmin, requireRole("admin"), getAdminProfile);

export default router;
