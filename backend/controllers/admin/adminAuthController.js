import { authenticateAdmin, getAdminProfileData } from "../../services/admin/adminAuthService.js";

/**
 * @desc    Authenticate admin & get token
 * @route   POST /api/admin/login
 * @access  Public
 */
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const data = await authenticateAdmin(email, password);

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token: data.token,
      admin: data.admin,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Server authentication error",
    });
  }
};

/**
 * @desc    Get current logged in admin profile
 * @route   GET /api/admin/profile
 * @access  Private (Admin Only)
 */
export const getAdminProfile = async (req, res) => {
  try {
    // req.admin is set by the adminAuth middleware
    const adminId = req.admin ? req.admin._id || req.admin.id : req.user ? req.user._id : null;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, admin identity missing",
      });
    }

    const adminProfile = await getAdminProfileData(adminId);

    return res.status(200).json({
      success: true,
      admin: adminProfile,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve admin profile",
    });
  }
};
