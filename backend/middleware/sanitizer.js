/**
 * 🧹 Input Sanitization Middleware for Express 5
 * Recursively trims and strips potentially harmful HTML/script tags from string inputs
 */
const sanitizeValue = (val) => {
  if (typeof val === "string") {
    return val.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").trim();
  }
  if (val !== null && typeof val === "object") {
    for (const key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        val[key] = sanitizeValue(val[key]);
      }
    }
  }
  return val;
};

export const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === "object") {
    sanitizeValue(req.query);
  }
  if (req.params && typeof req.params === "object") {
    sanitizeValue(req.params);
  }
  next();
};
