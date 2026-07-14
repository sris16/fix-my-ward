import express from "express";
import {
  getAdminDepartments,
  getAdminDepartmentByName,
} from "../../controllers/admin/adminDepartmentController.js";
import { protectAdmin, requireRole } from "../../middleware/adminAuth.js";

const router = express.Router();

// 🔐 Protected Admin Department Workstation APIs
router.get("/departments", protectAdmin, requireRole("admin"), getAdminDepartments);
router.get("/departments/:departmentName", protectAdmin, requireRole("admin"), getAdminDepartmentByName);

export default router;
