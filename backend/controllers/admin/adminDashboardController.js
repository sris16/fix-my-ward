import { getDashboardKPIsService } from "../../services/admin/adminDashboardService.js";

/**
 * @desc    Get dashboard KPIs, department stats, recent reports and recent activity
 * @route   GET /api/admin/dashboard/kpis
 * @access  Private (Admin Only)
 */
export const getDashboardKPIs = async (req, res) => {
  try {
    const data = await getDashboardKPIsService();
    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve dashboard KPIs",
    });
  }
};
