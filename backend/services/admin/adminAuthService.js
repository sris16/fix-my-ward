import Admin from "../../models/Admin.js";
import generateToken from "../../utils/generateToken.js";

/**
 * Service to handle Admin Login authentication
 */
export const authenticateAdmin = async (email, password) => {
  const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

  if (!admin) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (!admin.isActive) {
    const error = new Error("Admin account is deactivated. Please contact root administrator.");
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await admin.matchPassword(password);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // Update last login timestamp
  admin.lastLogin = new Date();
  await admin.save();

  // Generate JWT token
  const token = generateToken(admin._id, admin.role);

  return {
    token,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      department: admin.department,
      designation: admin.designation,
      avatar: admin.avatar,
      lastLogin: admin.lastLogin,
    },
  };
};

/**
 * Service to fetch Admin Profile data
 */
export const getAdminProfileData = async (adminId) => {
  const admin = await Admin.findById(adminId).select("-password");

  if (!admin) {
    const error = new Error("Admin profile not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    department: admin.department,
    designation: admin.designation,
    avatar: admin.avatar,
    isActive: admin.isActive,
    lastLogin: admin.lastLogin,
    createdAt: admin.createdAt,
  };
};
