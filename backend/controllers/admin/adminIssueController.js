import {
  getAdminIssuesService,
  getAdminIssueByIdService,
  verifyAdminIssueService,
  rejectAdminIssueService,
  assignAdminIssueService,
  updateAdminIssuePriorityService,
  updateAdminIssueStatusService,
} from "../../services/admin/adminIssueService.js";

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

/**
 * @desc    Phase 2: Verify an issue
 * @route   PATCH /api/admin/issues/:id/verify
 * @access  Private (Admin Only)
 */
export const verifyAdminIssue = async (req, res) => {
  try {
    const issue = await verifyAdminIssueService(req.params.id, req.admin._id, {
      reason: req.body?.reason || "",
    });
    return res.status(200).json({
      success: true,
      message: "Issue verified successfully",
      issue,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to verify issue",
    });
  }
};

/**
 * @desc    Phase 2: Reject an issue
 * @route   PATCH /api/admin/issues/:id/reject
 * @access  Private (Admin Only)
 */
export const rejectAdminIssue = async (req, res) => {
  try {
    const issue = await rejectAdminIssueService(req.params.id, req.admin._id, {
      reason: req.body?.reason || "",
    });
    return res.status(200).json({
      success: true,
      message: "Issue rejected successfully",
      issue,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to reject issue",
    });
  }
};

/**
 * @desc    Phase 3: Assign Department & Officer
 * @route   PATCH /api/admin/issues/:id/assign
 * @access  Private (Admin Only)
 */
export const assignAdminIssue = async (req, res) => {
  try {
    const { department, assignedOfficer } = req.body;
    const issue = await assignAdminIssueService(req.params.id, req.admin._id, {
      department,
      assignedOfficer,
    });
    return res.status(200).json({
      success: true,
      message: "Issue assigned successfully",
      issue,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to assign issue",
    });
  }
};

/**
 * @desc    Phase 4: Update Priority
 * @route   PATCH /api/admin/issues/:id/priority
 * @access  Private (Admin Only)
 */
export const updateAdminIssuePriority = async (req, res) => {
  try {
    const { priority, note } = req.body;
    const issue = await updateAdminIssuePriorityService(req.params.id, req.admin._id, {
      priority,
      note,
    });
    return res.status(200).json({
      success: true,
      message: "Priority updated successfully",
      issue,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update priority",
    });
  }
};

/**
 * @desc    Phase 5: Update Status
 * @route   PATCH /api/admin/issues/:id/status
 * @access  Private (Admin Only)
 */
export const updateAdminIssueStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const issue = await updateAdminIssueStatusService(req.params.id, req.admin._id, {
      status,
      note,
    });
    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      issue,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update status",
    });
  }
};
