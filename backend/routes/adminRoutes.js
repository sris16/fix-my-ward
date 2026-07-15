import express from "express";
import adminAuthRoutes from "./admin/adminAuthRoutes.js";
import adminIssueRoutes from "./admin/adminIssueRoutes.js";
import adminDashboardRoutes from "./admin/adminDashboardRoutes.js";
import adminDepartmentRoutes from "./admin/adminDepartmentRoutes.js";
import adminAnalyticsRoutes from "./admin/adminAnalyticsRoutes.js";
import adminLiveMonitorRoutes from "./admin/adminLiveMonitorRoutes.js";
import adminNotificationRoutes from "./admin/adminNotificationRoutes.js";

const router = express.Router();

// 🔐 Mount Admin Auth APIs (/api/admin/login, /api/admin/profile)
router.use("/", adminAuthRoutes);

// 📋 Mount Admin Issue APIs (/api/admin/issues, /api/admin/issues/:id, /timeline, /notes)
router.use("/", adminIssueRoutes);

// 📊 Mount Admin Dashboard KPI APIs (/api/admin/dashboard/kpis)
router.use("/", adminDashboardRoutes);

// 🏢 Mount Admin Department Workstation APIs (/api/admin/departments, /api/admin/departments/:departmentName)
router.use("/", adminDepartmentRoutes);

// 📈 Mount Admin Executive Analytics & Intelligence APIs (/api/admin/analytics/overview, /categories, /departments, /trends, /distributions)
router.use("/", adminAnalyticsRoutes);

// 🚨 Mount Admin Live Command Center APIs (/api/admin/live/overview, /activity, /issues, /wards)
router.use("/", adminLiveMonitorRoutes);

// 🔔 Mount Admin Notification Center & Broadcast APIs (/api/admin/notifications, /broadcast, /broadcasts)
router.use("/", adminNotificationRoutes);

export default router;