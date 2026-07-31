import rateLimit from "express-rate-limit";

/**
 * 🛡️ Global API Rate Limiter
 * Limits general requests to 300 per 15-minute window per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
});

/**
 * 🔐 Strict Auth Rate Limiter
 * Limits auth login/register attempts to 15 per 15-minute window per IP to prevent brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Account protection triggered. Please try again after 15 minutes.",
  },
});
