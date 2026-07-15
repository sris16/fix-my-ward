import express from "express";
import {
  getAdminNotifications,
  broadcastNotification,
  getBroadcastHistory,
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
router.put("/notifications/:id/read", protectAdmin, requireRole("admin"), markNotificationAsRead);
router.put("/notifications/read-all", protectAdmin, requireRole("admin"), markAllNotificationsAsRead);
router.delete("/notifications/:id", protectAdmin, requireRole("admin"), deleteNotification);

export default router;
