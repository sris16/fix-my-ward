import {
  getAdminNotificationsService,
  broadcastNotificationService,
  getBroadcastHistoryService,
  markNotificationAsReadService,
  markAllNotificationsAsReadService,
  deleteNotificationService,
  getNotificationTemplatesService,
  renderNotificationTemplate,
  getAdminNotificationPreferencesService,
  updateAdminNotificationPreferencesService
} from "../../services/admin/adminNotificationService.js";

/**
 * @desc    Get all notifications for admin (plus search, filter, pagination, unread count)
 * @route   GET /api/admin/notifications
 * @access  Private (Admin Only)
 */
export const getAdminNotifications = async (req, res) => {
  try {
    const adminId = req.admin ? req.admin._id || req.admin.id : req.user ? req.user._id : null;
    const data = await getAdminNotificationsService(adminId, req.query);
    return res.status(200).json({
      success: true,
      ...data
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve notifications"
    });
  }
};

/**
 * @desc    Broadcast announcement to citizens, departments, or wards
 * @route   POST /api/admin/notifications/broadcast
 * @access  Private (Admin Only)
 */
export const broadcastNotification = async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required to broadcast notification"
      });
    }

    const broadcast = await broadcastNotificationService(req.admin, req.body);
    return res.status(201).json({
      success: true,
      message: "Broadcast announcement dispatched successfully",
      broadcast
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to dispatch broadcast notification"
    });
  }
};

/**
 * @desc    Get history of sent broadcasts
 * @route   GET /api/admin/notifications/broadcasts
 * @access  Private (Admin Only)
 */
export const getBroadcastHistory = async (req, res) => {
  try {
    const broadcasts = await getBroadcastHistoryService();
    return res.status(200).json({
      success: true,
      broadcasts
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve broadcast history"
    });
  }
};

/**
 * @desc    Get reusable notification templates catalog
 * @route   GET /api/admin/notifications/templates
 * @access  Private (Admin Only)
 */
export const getNotificationTemplates = async (req, res) => {
  try {
    const templates = await getNotificationTemplatesService();
    return res.status(200).json({
      success: true,
      templates
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve notification templates"
    });
  }
};

/**
 * @desc    Preview render a template with custom placeholder data
 * @route   POST /api/admin/notifications/templates/preview
 * @access  Private (Admin Only)
 */
export const renderPreviewTemplate = async (req, res) => {
  try {
    const { templateKey, placeholders = {} } = req.body;
    const rendered = renderNotificationTemplate(templateKey, placeholders);
    return res.status(200).json({
      success: true,
      rendered
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to render template preview"
    });
  }
};

/**
 * @desc    Get admin notification preferences
 * @route   GET /api/admin/notifications/preferences
 * @access  Private (Admin Only)
 */
export const getAdminNotificationPreferences = async (req, res) => {
  try {
    const adminId = req.admin ? req.admin._id || req.admin.id : null;
    const preferences = await getAdminNotificationPreferencesService(adminId);
    return res.status(200).json({
      success: true,
      preferences
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve notification preferences"
    });
  }
};

/**
 * @desc    Update admin notification preferences
 * @route   PUT /api/admin/notifications/preferences
 * @access  Private (Admin Only)
 */
export const updateAdminNotificationPreferences = async (req, res) => {
  try {
    const adminId = req.admin ? req.admin._id || req.admin.id : null;
    const preferences = await updateAdminNotificationPreferencesService(adminId, req.body);
    return res.status(200).json({
      success: true,
      message: "Notification preferences updated successfully",
      preferences
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update notification preferences"
    });
  }
};

/**
 * @desc    Mark specific notification as read
 * @route   PUT /api/admin/notifications/:id/read
 * @access  Private (Admin Only)
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await markNotificationAsReadService(req.params.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }
    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to mark notification as read"
    });
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/admin/notifications/read-all
 * @access  Private (Admin Only)
 */
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await markAllNotificationsAsReadService();
    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to mark all notifications as read"
    });
  }
};

/**
 * @desc    Delete notification
 * @route   DELETE /api/admin/notifications/:id
 * @access  Private (Admin Only)
 */
export const deleteNotification = async (req, res) => {
  try {
    const deleted = await deleteNotificationService(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }
    return res.status(200).json({
      success: true,
      message: "Notification removed successfully"
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to delete notification"
    });
  }
};
