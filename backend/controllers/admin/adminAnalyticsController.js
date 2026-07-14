import {
  getAnalyticsOverviewService,
  getAnalyticsCategoriesService,
  getAnalyticsDepartmentsService,
  getAnalyticsTrendsService,
  getAnalyticsDistributionsService,
  getAnalyticsReportsService
} from "../../services/admin/adminAnalyticsService.js";

/**
 * @desc    Get executive overview metrics
 * @route   GET /api/admin/analytics/overview
 * @access  Private (Admin Only)
 */
export const getAnalyticsOverview = async (req, res) => {
  try {
    const overview = await getAnalyticsOverviewService();
    return res.status(200).json({
      success: true,
      ...overview
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve analytics overview metrics"
    });
  }
};

/**
 * @desc    Get category analytics distribution and SLAs
 * @route   GET /api/admin/analytics/categories
 * @access  Private (Admin Only)
 */
export const getAnalyticsCategories = async (req, res) => {
  try {
    const categories = await getAnalyticsCategoriesService();
    return res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve category analytics"
    });
  }
};

/**
 * @desc    Get department analytics
 * @route   GET /api/admin/analytics/departments
 * @access  Private (Admin Only)
 */
export const getAnalyticsDepartments = async (req, res) => {
  try {
    const departments = await getAnalyticsDepartmentsService();
    return res.status(200).json({
      success: true,
      departments
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve department analytics"
    });
  }
};

/**
 * @desc    Get time series trends (Daily, Weekly, Monthly, Yearly)
 * @route   GET /api/admin/analytics/trends
 * @access  Private (Admin Only)
 */
export const getAnalyticsTrends = async (req, res) => {
  try {
    const { timeframe } = req.query; // 'daily' | 'weekly' | 'monthly' | 'yearly'
    const trends = await getAnalyticsTrendsService(timeframe || "weekly");
    return res.status(200).json({
      success: true,
      trends
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve analytics trends"
    });
  }
};

/**
 * @desc    Get priority and status distribution (Pie/Donut charts)
 * @route   GET /api/admin/analytics/distributions
 * @access  Private (Admin Only)
 */
export const getAnalyticsDistributions = async (req, res) => {
  try {
    const distributions = await getAnalyticsDistributionsService();
    return res.status(200).json({
      success: true,
      ...distributions
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve analytics distributions"
    });
  }
};

/**
 * @desc    Get filtered report dataset for CSV & PDF Export
 * @route   GET /api/admin/analytics/reports
 * @access  Private (Admin Only)
 */
export const getAnalyticsReports = async (req, res) => {
  try {
    const reportData = await getAnalyticsReportsService(req.query);
    return res.status(200).json({
      success: true,
      ...reportData
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to generate analytics report dataset"
    });
  }
};
