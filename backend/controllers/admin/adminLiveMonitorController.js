import {
  getLiveOverviewService,
  getLiveActivityService,
  getLiveIssuesService
} from "../../services/admin/adminLiveMonitorService.js";

/**
 * @desc    Get Live Command Center Overview & KPIs
 * @route   GET /api/admin/live/overview
 * @access  Private (Admin Only)
 */
export const getLiveOverview = async (req, res) => {
  try {
    const overview = await getLiveOverviewService();
    return res.status(200).json({
      success: true,
      ...overview
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve Live Command Center overview"
    });
  }
};

/**
 * @desc    Get Live Activity Feed (IssueHistory events)
 * @route   GET /api/admin/live/activity
 * @access  Private (Admin Only)
 */
export const getLiveActivity = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 25;
    const activity = await getLiveActivityService(limit);
    return res.status(200).json({
      success: true,
      activity
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve live activity feed"
    });
  }
};

/**
 * @desc    Get Active Issues for GIS Map & Emergency Queue
 * @route   GET /api/admin/live/issues
 * @access  Private (Admin Only)
 */
export const getLiveIssues = async (req, res) => {
  try {
    const issues = await getLiveIssuesService(req.query);
    return res.status(200).json({
      success: true,
      issues
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve live active issues"
    });
  }
};
