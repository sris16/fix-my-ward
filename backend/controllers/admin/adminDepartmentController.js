import {
  getAdminDepartmentsService,
  getAdminDepartmentByNameService,
} from "../../services/admin/adminDepartmentService.js";

/**
 * @desc    Get summary metrics for all municipal departments
 * @route   GET /api/admin/departments
 * @access  Private (Admin Only)
 */
export const getAdminDepartments = async (req, res) => {
  try {
    const departments = await getAdminDepartmentsService();
    return res.status(200).json({
      success: true,
      departments,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve department metrics",
    });
  }
};

/**
 * @desc    Get detailed operational dashboard metrics for a specific department
 * @route   GET /api/admin/departments/:departmentName
 * @access  Private (Admin Only)
 */
export const getAdminDepartmentByName = async (req, res) => {
  try {
    const departmentData = await getAdminDepartmentByNameService(req.params.departmentName);
    return res.status(200).json({
      success: true,
      ...departmentData,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve department details",
    });
  }
};
