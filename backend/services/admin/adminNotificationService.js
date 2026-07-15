import mongoose from "mongoose";
import Notification from "../../models/Notification.js";
import User from "../../models/User.js";
import Admin from "../../models/Admin.js";

/**
 * Core Helper: Create a notification record in MongoDB
 */
export const createNotificationService = async (data) => {
  const notification = new Notification({
    recipient: data.recipient || "ALL_ADMINS",
    userId: mongoose.Types.ObjectId.isValid(data.recipient) ? data.recipient : null,
    recipientType: data.recipientType || "Admin",
    sender: data.sender || null,
    title: data.title || "System Notification",
    message: data.message || "",
    type: data.type || "Information",
    priority: data.priority || "Medium",
    relatedIssue: data.relatedIssue || data.issueId || null,
    issueId: data.relatedIssue || data.issueId || null,
    department: data.department || "General",
    status: data.status || "Delivered",
    read: data.read !== undefined ? data.read : false,
    deliveryChannel: data.deliveryChannel || "In-App",
    metadata: data.metadata || {}
  });

  return await notification.save();
};

/**
 * Phase 2 & Phase 5: Centralized Issue Lifecycle Notification & Citizen Communication Engine
 * Automatically generates appropriate notifications for both administrators and reporting citizens.
 */
export const generateIssueLifecycleNotification = async (action, issue, admin, metadata = {}) => {
  if (!issue) return;

  const ticketId = `#FMW-${issue._id.toString().slice(-6).toUpperCase()}`;
  const citizenId = issue.reportedBy || issue.userId;
  const adminName = admin?.name || "Administrator";
  const departmentName = issue.department || metadata.department || "Municipal Core";

  const notificationsToCreate = [];

  switch (action) {
    case "VERIFY_ISSUE": {
      // 1. Notify Citizen
      if (citizenId) {
        const rendered = renderNotificationTemplate("ISSUE_VERIFIED_CITIZEN", {
          citizenName: issue.reportedBy?.name || "Citizen",
          ticketId,
          issueTitle: issue.title
        });
        notificationsToCreate.push({
          recipient: citizenId,
          recipientType: "Citizen",
          title: rendered.title,
          message: rendered.message,
          type: "Information",
          priority: "Medium",
          relatedIssue: issue._id,
          department: departmentName
        });
      }
      // 2. Notify Admins / Department Queue
      notificationsToCreate.push({
        recipient: "ALL_ADMINS",
        recipientType: "Admin",
        title: `Issue Verified: ${ticketId}`,
        message: `${adminName} verified complaint "${issue.title}". Ready for division allocation.`,
        type: "Success",
        priority: "Medium",
        relatedIssue: issue._id,
        department: departmentName
      });
      break;
    }

    case "ASSIGN_DEPARTMENT": {
      // 1. Notify Citizen
      if (citizenId) {
        const rendered = renderNotificationTemplate("ISSUE_ASSIGNED_CITIZEN", {
          citizenName: issue.reportedBy?.name || "Citizen",
          ticketId,
          department: departmentName
        });
        notificationsToCreate.push({
          recipient: citizenId,
          recipientType: "Citizen",
          title: rendered.title,
          message: rendered.message,
          type: "Information",
          priority: "High",
          relatedIssue: issue._id,
          department: departmentName
        });
      }
      // 2. Notify Department Team
      const deptRendered = renderNotificationTemplate("DEPARTMENT_UPDATE_OPERATIONS", {
        department: departmentName,
        ticketId,
        issueTitle: issue.title,
        adminName
      });
      notificationsToCreate.push({
        recipient: departmentName,
        recipientType: "Department",
        title: deptRendered.title,
        message: deptRendered.message,
        type: "Warning",
        priority: issue.priority || "Medium",
        relatedIssue: issue._id,
        department: departmentName
      });
      break;
    }

    case "CHANGE_PRIORITY": {
      const rendered = renderNotificationTemplate("PRIORITY_ESCALATED_ADMIN", {
        ticketId,
        issueTitle: issue.title,
        newValue: metadata.newValue || issue.priority,
        adminName
      });
      notificationsToCreate.push({
        recipient: "ALL_ADMINS",
        recipientType: "Admin",
        title: rendered.title,
        message: rendered.message,
        type: (metadata.newValue === "Critical" || issue.priority === "Critical") ? "Emergency" : "Warning",
        priority: metadata.newValue || issue.priority || "High",
        relatedIssue: issue._id,
        department: departmentName
      });
      break;
    }

    case "CHANGE_STATUS": {
      // 1. Notify Citizen of progress
      if (citizenId) {
        const newStatus = metadata.newValue || issue.status;
        const isResolved = newStatus === "Resolved";
        const rendered = isResolved
          ? renderNotificationTemplate("ISSUE_RESOLVED_CITIZEN", {
              citizenName: issue.reportedBy?.name || "Citizen",
              ticketId,
              issueTitle: issue.title,
              department: departmentName
            })
          : {
              title: `Status Updated: ${newStatus}`,
              message: `Your issue (${ticketId}) status has transitioned to "${newStatus}". Our teams are actively on the ground.`
            };

        notificationsToCreate.push({
          recipient: citizenId,
          recipientType: "Citizen",
          title: rendered.title,
          message: rendered.message,
          type: isResolved ? "Success" : "Information",
          priority: isResolved ? "High" : "Medium",
          relatedIssue: issue._id,
          department: departmentName
        });
      }
      // 2. Notify Admins
      notificationsToCreate.push({
        recipient: "ALL_ADMINS",
        recipientType: "Admin",
        title: `Status Changed: ${ticketId} -> ${metadata.newValue || issue.status}`,
        message: `${adminName} updated status of "${issue.title}" to ${metadata.newValue || issue.status}.`,
        type: "Information",
        priority: "Medium",
        relatedIssue: issue._id,
        department: departmentName
      });
      break;
    }

    case "REJECT_ISSUE":
      if (citizenId) {
        notificationsToCreate.push({
          recipient: citizenId,
          recipientType: "Citizen",
          title: "Complaint Inspection Notice",
          message: `Regarding issue (${ticketId}: ${issue.title}), field inspection concluded that the report could not be processed at this time. Note: ${metadata.note || "Duplicate or non-jurisdictional report."}`,
          type: "Warning",
          priority: "High",
          relatedIssue: issue._id,
          department: departmentName
        });
      }
      break;

    case "ADD_NOTE":
      notificationsToCreate.push({
        recipient: "ALL_ADMINS",
        recipientType: "Admin",
        title: `New Note on ${ticketId}`,
        message: `${adminName} added field note to "${issue.title}": "${metadata.note || ""}"`,
        type: "Information",
        priority: "Low",
        relatedIssue: issue._id,
        department: departmentName
      });
      break;

    default:
      break;
  }

  // Execute saves
  for (const notifData of notificationsToCreate) {
    try {
      await createNotificationService(notifData);
    } catch (err) {
      console.error("Error creating lifecycle notification:", err);
    }
  }
};

/**
 * Phase 3 & 8: Get Admin Notifications & Bell Unread Summary
 */
export const getAdminNotificationsService = async (adminId, query = {}) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 25;
  const skip = (page - 1) * limit;

  // Query conditions: matching all admin alerts or broadcast alerts
  const filter = {
    $or: [
      { recipient: "ALL_ADMINS" },
      { recipient: adminId },
      { recipientType: "Admin" },
      { recipientType: "Broadcast" }
    ]
  };

  if (query.read !== undefined && query.read !== "ALL") {
    filter.read = query.read === "true" || query.read === true;
  }
  if (query.type && query.type !== "ALL") {
    filter.type = query.type;
  }
  if (query.priority && query.priority !== "ALL") {
    filter.priority = query.priority;
  }
  if (query.search && query.search.trim() !== "") {
    const searchRegex = new RegExp(query.search.trim(), "i");
    filter.$or = [
      { title: searchRegex },
      { message: searchRegex },
      { department: searchRegex }
    ];
  }

  const [notifications, totalCount, unreadCount] = await Promise.all([
    Notification.find(filter)
      .populate("sender", "name email role")
      .populate("relatedIssue", "title status priority category department locationText")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ ...filter, read: false })
  ]);

  return {
    notifications: notifications.map((n) => ({
      ...n,
      id: n._id,
      ticketId: n.relatedIssue?._id ? `#FMW-${n.relatedIssue._id.toString().slice(-6).toUpperCase()}` : null,
      issueTitle: n.relatedIssue?.title || null
    })),
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    },
    unreadCount
  };
};

/**
 * Phase 4: Broadcast Announcements & History
 */
export const broadcastNotificationService = async (senderAdmin, broadcastData) => {
  const { title, message, target, type, priority, department } = broadcastData;

  const targetRecipient = target || "ALL_CITIZENS";
  const recipientType = targetRecipient === "ALL_CITIZENS" ? "Citizen" : targetRecipient === "ALL_DEPARTMENTS" ? "Department" : "Broadcast";

  // 1. Create central broadcast audit record
  const broadcastRecord = await createNotificationService({
    recipient: targetRecipient,
    recipientType: "Broadcast",
    sender: senderAdmin?._id || null,
    title,
    message,
    type: type || "Information",
    priority: priority || "High",
    department: department || "Municipal Core",
    status: "Delivered",
    read: false,
    deliveryChannel: "In-App",
    metadata: { broadcastTarget: targetRecipient }
  });

  // 2. If targeted to citizens, also mirror notifications for active citizen accounts so they appear directly in their inbox
  if (targetRecipient === "ALL_CITIZENS") {
    try {
      const activeCitizens = await User.find({ role: "citizen" }, "_id").limit(200).lean();
      const mirrorTasks = activeCitizens.map((user) =>
        createNotificationService({
          recipient: user._id,
          userId: user._id,
          recipientType: "Citizen",
          sender: senderAdmin?._id || null,
          title,
          message,
          type: type || "Information",
          priority: priority || "High",
          department: department || "Municipal Core",
          status: "Delivered",
          read: false
        })
      );
      if (mirrorTasks.length > 0) {
        await Promise.all(mirrorTasks);
      }
    } catch (err) {
      console.error("Bulk citizen broadcast mirroring notice:", err);
    }
  }

  return broadcastRecord;
};

/**
 * Phase 4: Get Broadcast History
 */
export const getBroadcastHistoryService = async () => {
  const broadcasts = await Notification.find({
    recipientType: "Broadcast"
  })
    .populate("sender", "name email role")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return broadcasts.map((b) => ({
    id: b._id,
    title: b.title,
    message: b.message,
    target: b.recipient,
    type: b.type,
    priority: b.priority,
    senderName: b.sender?.name || "Administrator",
    department: b.department || "Municipal Core",
    status: b.status || "Delivered",
    createdAt: b.createdAt
  }));
};

/**
 * Phase 3 & 8: Read status update helpers
 */
export const markNotificationAsReadService = async (notificationId) => {
  return await Notification.findByIdAndUpdate(
    notificationId,
    { read: true },
    { new: true }
  );
};

export const markAllNotificationsAsReadService = async () => {
  return await Notification.updateMany(
    { read: false },
    { $set: { read: true } }
  );
};

export const deleteNotificationService = async (notificationId) => {
  return await Notification.findByIdAndDelete(notificationId);
};

/**
 * ============================================================================
 * Phase 6 — Reusable Notification Template Catalog & Rendering Engine
 * ============================================================================
 */
export const NOTIFICATION_TEMPLATES = [
  {
    key: "ISSUE_VERIFIED_CITIZEN",
    name: "Issue Verified (Citizen Alert)",
    category: "Citizen Communication",
    titleTemplate: "Complaint Verified by Municipal Command",
    messageTemplate: "Hello {{citizenName}}, your reported issue ({{ticketId}}: {{issueTitle}}) has been formally verified by our administrative team and queued for department assignment.",
    placeholders: ["citizenName", "ticketId", "issueTitle"]
  },
  {
    key: "ISSUE_ASSIGNED_CITIZEN",
    name: "Department Assigned (Citizen Alert)",
    category: "Citizen Communication",
    titleTemplate: "Department Allocated to Your Complaint",
    messageTemplate: "Hello {{citizenName}}, your issue {{ticketId}} has been assigned to the {{department}} division for field resolution.",
    placeholders: ["citizenName", "ticketId", "department"]
  },
  {
    key: "PRIORITY_ESCALATED_ADMIN",
    name: "Priority Escalated (Admin Alert)",
    category: "Operational Alert",
    titleTemplate: "Priority Escalated: {{ticketId}}",
    messageTemplate: "Hazard severity for \"{{issueTitle}}\" changed to {{newValue}} by {{adminName}}.",
    placeholders: ["ticketId", "issueTitle", "newValue", "adminName"]
  },
  {
    key: "ISSUE_RESOLVED_CITIZEN",
    name: "Issue Resolved (Citizen Alert)",
    category: "Citizen Communication",
    titleTemplate: "🎉 Complaint Resolved!",
    messageTemplate: "Hello {{citizenName}}, we are pleased to inform you that your reported issue ({{ticketId}}: {{issueTitle}}) has been successfully resolved by {{department}}. Thank you for improving our civic community!",
    placeholders: ["citizenName", "ticketId", "issueTitle", "department"]
  },
  {
    key: "EMERGENCY_ALERT_BROADCAST",
    name: "Emergency Alert (Broadcast)",
    category: "Citywide Broadcast",
    titleTemplate: "🚨 Emergency Municipal Advisory: {{title}}",
    messageTemplate: "Critical Alert for {{target}}: {{message}}. Department in charge: {{department}}.",
    placeholders: ["title", "target", "message", "department"]
  },
  {
    key: "MAINTENANCE_NOTICE_BROADCAST",
    name: "Maintenance Notice (Broadcast)",
    category: "Citywide Broadcast",
    titleTemplate: "🚧 Scheduled Infrastructure Maintenance",
    messageTemplate: "Attention {{target}}: Scheduled maintenance will affect {{department}} operations starting {{timeText}}. Please plan accordingly.",
    placeholders: ["target", "department", "timeText"]
  },
  {
    key: "DEPARTMENT_UPDATE_OPERATIONS",
    name: "Department Workload Update",
    category: "Operational Alert",
    titleTemplate: "Caseload Allocated to {{department}}",
    messageTemplate: "New high-priority ticket {{ticketId}} ({{issueTitle}}) has been routed to {{department}} by {{adminName}}.",
    placeholders: ["department", "ticketId", "issueTitle", "adminName"]
  }
];

export const renderNotificationTemplate = (templateKey, placeholders = {}) => {
  const template = NOTIFICATION_TEMPLATES.find((t) => t.key === templateKey);
  if (!template) {
    return {
      title: placeholders.title || "System Notification",
      message: placeholders.message || ""
    };
  }

  let title = template.titleTemplate;
  let message = template.messageTemplate;

  for (const [key, val] of Object.entries(placeholders)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    title = title.replace(regex, val || "");
    message = message.replace(regex, val || "");
  }

  return { title, message };
};

export const getNotificationTemplatesService = async () => {
  return NOTIFICATION_TEMPLATES;
};

/**
 * ============================================================================
 * Phase 7 — Extensible Notification Preferences Architecture
 * ============================================================================
 */
export const getAdminNotificationPreferencesService = async (adminId) => {
  if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
    return {
      inApp: true,
      emailAlerts: false,
      smsAlerts: false,
      pushNotifications: false,
      minimumPriority: "Low",
      channels: {
        citizenReports: true,
        departmentEscalations: true,
        emergencyBroadcasts: true,
        systemAuditNotes: true
      }
    };
  }

  const admin = await Admin.findById(adminId).select("metadata name email").lean();
  const prefs = admin?.metadata?.notificationPreferences || {};

  return {
    inApp: prefs.inApp !== undefined ? prefs.inApp : true,
    emailAlerts: prefs.emailAlerts !== undefined ? prefs.emailAlerts : false,
    smsAlerts: prefs.smsAlerts !== undefined ? prefs.smsAlerts : false,
    pushNotifications: prefs.pushNotifications !== undefined ? prefs.pushNotifications : false,
    minimumPriority: prefs.minimumPriority || "Low",
    channels: {
      citizenReports: prefs.channels?.citizenReports !== undefined ? prefs.channels.citizenReports : true,
      departmentEscalations: prefs.channels?.departmentEscalations !== undefined ? prefs.channels.departmentEscalations : true,
      emergencyBroadcasts: prefs.channels?.emergencyBroadcasts !== undefined ? prefs.channels.emergencyBroadcasts : true,
      systemAuditNotes: prefs.channels?.systemAuditNotes !== undefined ? prefs.channels.systemAuditNotes : true
    }
  };
};

export const updateAdminNotificationPreferencesService = async (adminId, newPrefs) => {
  if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
    const error = new Error("Valid Administrator identification is required to update preferences");
    error.statusCode = 401;
    throw error;
  }

  const admin = await Admin.findById(adminId);
  if (!admin) {
    const error = new Error("Administrator account not found");
    error.statusCode = 404;
    throw error;
  }

  admin.metadata = admin.metadata || {};
  admin.metadata.notificationPreferences = {
    ...(admin.metadata.notificationPreferences || {}),
    ...newPrefs,
    inApp: true // Phase 7: Always enforce In-App active per Version 8 specification
  };

  await admin.save();
  return admin.metadata.notificationPreferences;
};
