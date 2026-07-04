import { getAdminIssuesService, getAdminIssueByIdService } from "../../services/admin/adminIssueService.js";

/**
 * @desc    Get all issues with pagination, search, filters & sorting
 * @route   GET /api/admin/issues
 * @access  Private (Admin Only)
 */
export const getAdminIssues = async (req, res) => {
  try {
    const data = await getAdminIssuesService(req.query);
    return res.status(200).json({
      success: true,
      data: data.issues,
      pagination: data.pagination,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve issues",
    });
  }
};

/**
 * @desc    Get single issue by ID
 * @route   GET /api/admin/issues/:id
 * @access  Private (Admin Only)
 */
export const getAdminIssueById = async (req, res) => {
  try {
    const issue = await getAdminIssueByIdService(req.params.id);
    return res.status(200).json({
      success: true,
      issue,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve issue details",
    });
  }
};
