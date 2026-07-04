import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

/**
 * 🔐 Middleware to verify JWT and authenticate Admin requests
 */
export const protectAdmin = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Verify token payload and retrieve Admin document from DB
      const admin = await Admin.findById(decoded.id).select("-password");

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "Not authorized, admin account not found",
        });
      }

      if (!admin.isActive) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin account is inactive",
        });
      }

      req.admin = admin;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed or expired",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    });
  }
};

/**
 * 🛡️ Middleware to enforce specific roles (e.g. requireRole("admin"))
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.admin ? req.admin.role : req.user ? req.user.role : null;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "403 Access Denied: Insufficient permissions for this resource",
      });
    }

    next();
  };
};
