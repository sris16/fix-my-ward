import express from "express";
import {
  getPlatformOverview,
  getAllAdmins,
  createAdmin,
  toggleAdminStatus,
  resetAdminPassword,
  updateRolesMatrix,
  addDepartmentConfig,
  updateDepartmentConfig,
  addCategoryConfig,
  toggleCategoryStatus,
  addWardConfig,
  toggleWardStatus,
  updateTemplateConfig,
  updateSystemPreferences
} from "../../controllers/admin/adminSystemController.js";
import { protectAdmin, requireRole } from "../../middleware/adminAuth.js";

const router = express.Router();

// 🔐 Guard: Only Super Administrators can access Platform Administration Center
const superAdminGuard = [protectAdmin, requireRole("super-admin", "Super Administrator", "admin")];

// Phase 1: Platform Overview
router.get("/overview", superAdminGuard, getPlatformOverview);

// Phase 2: Admin Accounts Management
router.get("/admins", superAdminGuard, getAllAdmins);
router.post("/admins", superAdminGuard, createAdmin);
router.put("/admins/:id/status", superAdminGuard, toggleAdminStatus);
router.post("/admins/:id/reset-password", superAdminGuard, resetAdminPassword);

// Phase 3: Roles & Permissions
router.put("/roles", superAdminGuard, updateRolesMatrix);

// Phase 4: Department Configuration
router.post("/departments", superAdminGuard, addDepartmentConfig);
router.put("/departments/:id", superAdminGuard, updateDepartmentConfig);

// Phase 5: Category & Ward Configuration
router.post("/categories", superAdminGuard, addCategoryConfig);
router.put("/categories/:id/status", superAdminGuard, toggleCategoryStatus);
router.post("/wards", superAdminGuard, addWardConfig);
router.put("/wards/:id/status", superAdminGuard, toggleWardStatus);

// Phase 6: Notification Template Administration
router.put("/templates/:templateKey", superAdminGuard, updateTemplateConfig);

// Phase 7: System Preferences
router.put("/preferences", superAdminGuard, updateSystemPreferences);

export default router;
