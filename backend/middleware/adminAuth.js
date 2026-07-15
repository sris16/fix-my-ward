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
 * 🛡️ Middleware to enforce specific roles (e.g. requireRole("admin"), requireRole("super-admin"))
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.admin ? req.admin.role : req.user ? req.user.role : null;

    if (!userRole) {
      return res.status(403).json({
        success: false,
        message: "403 Access Denied: No role assigned to user identity",
      });
    }

    // 1. Super Administrator ("super-admin" or "Super Administrator") has universal command override across all modules
    if (userRole === "super-admin" || userRole === "Super Administrator") {
      return next();
    }

    // 2. If the endpoint requires general "admin" level access, allow all valid supervisory profiles
    if (allowedRoles.includes("admin")) {
      const validAdminRoles = [
        "admin",
        "super-admin",
        "Super Administrator",
        "Municipal Commissioner",
        "Department Manager",
        "Department Officer",
        "Viewer"
      ];
      if (validAdminRoles.includes(userRole)) {
        return next();
      }
    }

    // 3. Exact role match check
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `403 Access Denied: Role "${userRole}" lacks sufficient permissions (${allowedRoles.join(", ")})`,
      });
    }

    next();
  };
};
