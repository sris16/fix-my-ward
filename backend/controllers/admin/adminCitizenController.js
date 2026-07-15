import {
  getAdminCitizensService,
  getAdminCitizenProfileService
} from "../../services/admin/adminCitizenService.js";

// @desc    Get paginated, filtered, sorted citizens directory with engagement intelligence
// @route   GET /api/admin/citizens
// @access  Private/Admin
export const getAdminCitizens = async (req, res) => {
  try {
    const result = await getAdminCitizensService(req.query);
    res.status(200).json({
      success: true,
      citizens: result.citizens,
      summary: result.summary,
      pagination: result.pagination
    });
  } catch (error) {
    console.error("Error in getAdminCitizens:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error fetching citizens directory"
    });
  }
};

// @desc    Get complete read-only citizen profile, report history, communication & timeline
// @route   GET /api/admin/citizens/:id
// @access  Private/Admin
export const getAdminCitizenById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getAdminCitizenProfileService(id);
    res.status(200).json({
      success: true,
      profile: result.profile,
      reportHistory: result.reportHistory,
      communicationHistory: result.communicationHistory,
      timeline: result.timeline
    });
  } catch (error) {
    console.error(`Error in getAdminCitizenById (${req.params.id}):`, error.message);
    const statusCode = error.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve citizen profile"
    });
  }
};
