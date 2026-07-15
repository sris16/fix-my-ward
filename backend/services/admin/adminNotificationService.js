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
    case "VERIFY_ISSUE":
      // 1. Notify Citizen
      if (citizenId) {
        notificationsToCreate.push({
          recipient: citizenId,
          recipientType: "Citizen",
          title: "Complaint Verified by Municipal Command",
          message: `Hello Citizen, your reported issue (${ticketId}: ${issue.title}) has been formally verified by our administrative team and queued for department assignment.`,
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

    case "ASSIGN_DEPARTMENT":
      // 1. Notify Citizen
      if (citizenId) {
        notificationsToCreate.push({
          recipient: citizenId,
          recipientType: "Citizen",
          title: "Department Allocated to Your Complaint",
          message: `Your issue (${ticketId}) has been assigned to the ${departmentName} division for field resolution.`,
          type: "Information",
          priority: "High",
          relatedIssue: issue._id,
          department: departmentName
        });
      }
      // 2. Notify Department Team
      notificationsToCreate.push({
        recipient: departmentName,
        recipientType: "Department",
        title: `New Caseload Assigned: ${ticketId}`,
        message: `Complaint "${issue.title}" allocated to ${departmentName} by ${adminName}.`,
        type: "Warning",
        priority: issue.priority || "Medium",
        relatedIssue: issue._id,
        department: departmentName
      });
      break;

    case "CHANGE_PRIORITY":
      notificationsToCreate.push({
        recipient: "ALL_ADMINS",
        recipientType: "Admin",
        title: `Priority Escalated: ${ticketId}`,
        message: `Hazard severity for "${issue.title}" changed to ${metadata.newValue || issue.priority} by ${adminName}.`,
        type: (metadata.newValue === "Critical" || issue.priority === "Critical") ? "Emergency" : "Warning",
        priority: metadata.newValue || issue.priority || "High",
        relatedIssue: issue._id,
        department: departmentName
      });
      break;

    case "CHANGE_STATUS":
      // 1. Notify Citizen of progress
      if (citizenId) {
        const newStatus = metadata.newValue || issue.status;
        const isResolved = newStatus === "Resolved";
        notificationsToCreate.push({
          recipient: citizenId,
          recipientType: "Citizen",
          title: isResolved ? "🎉 Complaint Resolved!" : `Status Updated: ${newStatus}`,
          message: isResolved
            ? `We are pleased to inform you that your reported issue (${ticketId}: ${issue.title}) has been successfully resolved by ${departmentName}. Thank you for improving our civic community!`
            : `Your issue (${ticketId}) status has transitioned to "${newStatus}". Our teams are actively on the ground.`,
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
