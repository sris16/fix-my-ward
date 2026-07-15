import express from "express";
import {
  getAdminNotifications,
  broadcastNotification,
  getBroadcastHistory,
  getNotificationTemplates,
  renderPreviewTemplate,
  getAdminNotificationPreferences,
  updateAdminNotificationPreferences,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from "../../controllers/admin/adminNotificationController.js";
import { protectAdmin, requireRole } from "../../middleware/adminAuth.js";

const router = express.Router();

// 🔐 Protected Notification Center & Communication APIs
router.get("/notifications", protectAdmin, requireRole("admin"), getAdminNotifications);
router.post("/notifications/broadcast", protectAdmin, requireRole("admin"), broadcastNotification);
router.get("/notifications/broadcasts", protectAdmin, requireRole("admin"), getBroadcastHistory);

// Phase 6: Template Catalog & Preview
router.get("/notifications/templates", protectAdmin, requireRole("admin"), getNotificationTemplates);
router.post("/notifications/templates/preview", protectAdmin, requireRole("admin"), renderPreviewTemplate);

// Phase 7: Extensible Notification Preferences
router.get("/notifications/preferences", protectAdmin, requireRole("admin"), getAdminNotificationPreferences);
router.put("/notifications/preferences", protectAdmin, requireRole("admin"), updateAdminNotificationPreferences);

router.put("/notifications/read-all", protectAdmin, requireRole("admin"), markAllNotificationsAsRead);
router.put("/notifications/:id/read", protectAdmin, requireRole("admin"), markNotificationAsRead);
router.delete("/notifications/:id", protectAdmin, requireRole("admin"), deleteNotification);

export default router;
